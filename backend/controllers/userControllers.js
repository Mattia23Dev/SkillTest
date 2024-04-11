const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const examModel = require("../models/examModel");
const candidateModel = require("../models/candidateModel");
const fs = require('fs');
const path = require('path');
const {OAuth2Client} = require('google-auth-library');
const { welcomeEmail } = require("./emailControllers");
const openai = require('openai');
const apiKey = process.env.OPENAI_API;
const client = new OAuth2Client("830063440629-j40l5f7lb1fck6ap120s272d49rp1ph6.apps.googleusercontent.com");
const clientAi = new openai.OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
  model: 'gpt-4-turbo-preview',
});
//user registration
const register = async(req,res) => {
  console.log(req.body)
   try{
     const userExists = await User.findOne({email: req.body.email})
     if(userExists){
        res.status(200).send({
            message: "User already exists.",
            success: false
        })
     }
     else{
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            partitaIva: req.body.partitaIva,
            companyName: req.body.companyName,
        })
        await newUser.save()
        const token = jwt.sign({
          userid: newUser._id
      },process.env.JWT_SECRET,{})
      await welcomeEmail(newUser.name,newUser.email);
        res.status(200).send({
            message: "User registered successfully.",
            success: true,
            data: token
        })
     }
   }
   catch(error){
      res.status(400).send({
        message: error.message,
        data: error,
        success: false
      })
   }
}

//user login
const login = async(req,res) => {
   try{
     //check if user exists
     const user = await User.findOne({email: req.body.email})
     if(user){
        const passwordsMatched = await bcrypt.compare(req.body.password,user.password)
        //check if passwords are valid
        if(passwordsMatched){
            const token = jwt.sign({
                userid: user._id
            },process.env.JWT_SECRET,{})
            res.send({
              message: "User logged in successfully",
              data: token,
              success: true,
            })
        }
        else{
            res.status(200).send({
                message: "Invalid Password",
                success: false
            })
        }
     }
     else{
        res.status(200).send({
            message: "User doesnot exist.",
            success: false
        })
     }     
   }
   catch(error){
    res.status(400).send({
        message: error.message,
        data: error,
        success: false
    })
   }
}

//get user info
const getUserInfo = async(req,res) => {
   try{
      const user = await User.findOne({_id: req.body.userid})
      if(user){
        res.status(200).send({
            message: "User Info fetched successfully",
            data: user,
            success: true
        })
      }
      else{
        res.status(200).send({
            message: "Failed to fetch user info",
            data: null,
            success: false
        })
      }
   }
   catch(error){
    res.status(400).send({
        message: error.message,
        data: error,
        success: false
    })
   }
}

const getCandidateInfo = async (req, res) => {
    try {
      const { userId, examId } = req.body;
  
      const user = await candidateModel.findOne({ _id: userId }).populate({
        path: 'tests',
        match: { testId: examId },
        populate: { path: 'report' }
      });
  
      if (!user) {
        return res.status(404).send({
          message: "User not found",
          data: null,
          success: false
        });
      }
  
      return res.status(200).send({
        message: "User info fetched successfully",
        data: user,
        success: true
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        data: error,
        success: false
      });
    }
  };

  const changeStatusCandidate = async (req, res) => {
    try {
      const { userId, examId, newStatus } = req.body;
      console.log(req.body)
  
      // Trova l'esame dal suo id e popola i candidati
      const exam = await examModel.findOne({ _id: examId }).populate({
        path: 'candidates.candidate',
      });
  
      if (!exam) {
        return res.status(404).send({
          message: "Esame non trovato",
          data: null,
          success: false
        });
      }
  
      // Trova il candidato nell'array dei candidati
      const candidate = exam.candidates.find(c => c.candidate._id.toString() === userId);
  
      if (!candidate) {
        return res.status(404).send({
          message: "Candidato non trovato nell'esame",
          data: null,
          success: false
        });
      }
  
      // Cambia lo status del candidato
      candidate.status = newStatus;
  
      // Salva l'esame con lo status del candidato modificato
      await exam.save();
  
      return res.status(200).send({
        message: "Status del candidato modificato con successo",
        data: { userId, examId, newStatus },
        success: true
      });
    } catch (error) {
      return res.status(500).send({
        message: "Si è verificato un errore durante la modifica dello status del candidato",
        data: error.message,
        success: false
      });
    }
  };

  const extractPdfAi = async (text) => {
    try {
          const prompt = `
          Estrai informazioni importanti dal testo fornito seguendo questa scaletta:
          1. Lista delle 10 skills (abilità), hard skills o soft skills, o cose che ha svolto ma solo come competenza in lista:
          2. Educazione o istruzione, inserendo luogo di formazione, possibili voti (se forniti) e titoli di studio:
          3. Esperienze lavorative precedenti (solo esperienza, azienda in cui ha lavorato, anni da e quando, ruolo lavorativo);
        `;
          const exampleFormat = JSON.stringify(text);
          const requestData = {
             max_tokens: 1400, 
             n: 1,
             model: 'gpt-4-turbo-preview',
             messages: [
              { role: 'system', content: prompt},
              { role: 'user', content: text },
            ],
             temperature: 0.7,
             top_p: 1,
             frequency_penalty: 0,
             presence_penalty: 0,
             format: 'json'
           };
           const responseAI = await clientAi.chat.completions.create(requestData);
           const responses = responseAI.choices[0].message.content;
           const skillsRegex = /1\..+?((?=\n2\. )|(?=\n3\. )|$)/s;
           const educationRegex = /2\..+?((?=\n1\. )|(?=\n3\. )|$)/s;
           const workExperienceRegex = /3\..+?((?=\n1\. )|(?=\n2\. )|$)/s;
       
           const skillsMatch = responses.match(skillsRegex);
           const educationMatch = responses.match(educationRegex);
           const workExperienceMatch = responses.match(workExperienceRegex);
       
           const skills = skillsMatch ? skillsMatch[0] : '';
           const education = educationMatch ? educationMatch[0] : '';
           const workExperience = workExperienceMatch ? workExperienceMatch[0] : '';
           console.log('Skills:', skills);
           console.log('Education:', education);
           console.log('Work Experience:', workExperience);

           return { skills, education, workExperience };

    } catch (error) {
        console.error(error)
    }
}

const addCandidate = async(req, res) => {
    try {
        const { name, surname, email, phone, city, coverLetter, degree, testId, testName, trackLink, url, pdfText } = req.body;
        console.log(req.body);
        const cv = req.file.path; 

        const candidate = await candidateModel.findOne({ email });
        const {skills, education, workExperience} = await extractPdfAi(pdfText);

        if (!candidate) {
            const newCandidate = new candidateModel({
                name,
                surname,
                email,
                phone,
                city,
                cv,
                coverLetter,
                degree,
                cvUrl : url,
                tests: [{ testId, testName }],
                trackLead: "test",
            });

            await newCandidate.save();
            const cvFileName = `cv_${newCandidate._id}.pdf`;
            const updatedCandidate = await candidateModel.findByIdAndUpdate(
              newCandidate._id,
              { cv: cvFileName },
              { new: true }
            );
            await examModel.findByIdAndUpdate(testId, {
              $push: {
                candidates: {
                  candidate: newCandidate._id,
                  trackLink: trackLink,
                  skills: skills,
                  education: education,
                  workExperience: workExperience
                }
              }
            });
            const uploadFolderPath = path.resolve(__dirname, '..', 'uploads');
            const destinationPath = path.join(uploadFolderPath, cvFileName);
            fs.renameSync(cv, destinationPath);
            res.status(201).json({ message: 'Candidate added successfully', success: true, candidate: updatedCandidate });
        } else {
            const existingTest = candidate.tests.find(test => test.testId.toString() === testId);
            if (!existingTest) {
                await candidateModel.findOneAndUpdate(
                    { email },
                    { $push: { tests: { testId, testName } } }
                );
                await examModel.findByIdAndUpdate(testId, {
                  $push: {
                    candidates: {
                      candidate: candidate._id,
                      trackLink: trackLink,
                      skills: skills,
                      education: education,
                      workExperience: workExperience
                    }
                  }
                });
            }
            const updatedCandidate = await candidateModel.findOneAndUpdate(
                { email },
                { $pull: { tests: { testId: { $ne: testId } } } }, // Rimuovi tutti i test che non corrispondono all'ID desiderato
                { new: true } // Restituisci il nuovo documento aggiornato
            );
            res.status(201).json({ message: 'Candidate added successfully', success: true, candidate: updatedCandidate });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message, success: false });
    }
}

const googleLogin = async (req, res) => {
  const {tokenId} = req.body;

  client.verifyIdToken({idToken: tokenId, audience: "830063440629-j40l5f7lb1fck6ap120s272d49rp1ph6.apps.googleusercontent.com"}).then((response) => {
    const {email_verified, name, email} = response.payload; 
    if (email_verified) {
      console.log('email verificata');
      User.findOne({email})
      .exec(async(err, user) => {
        if (err){
          console.log(err);
          return res.status(400).json({
            error: 'Qualcosa è andato storto..'
          })
        } else {
          if (user){
            const token = jwt.sign({
              userid: user._id
          },process.env.JWT_SECRET,{})
            res.send({
              message: "User logged in successfully",
              data: token,
              success: true,
            })
          } else {
              let password = email+process.env.JWT_SECRET;
              
              let newUser = new User({
                name,
                email,
                password: password,
              });

              await newUser.save((err, data) => {
                if (err) {
                  console.log(err);
                  return res.status(400).json({
                    error: 'Qualcosa è andato storto..'
                  })
                };
                
  
                const token = jwt.sign({
                  userid: newUser._id
              },process.env.JWT_SECRET,{})

                res.send({
                  message: "User logged in successfully",
                  data: token,
                  success: true,
                })
              })
          }
        }
      })
    }
    console.log(response.payload);
  })
};

const modifyUserData = async (req, res) => {
  const userId = req.params.userId;
  const { name, partitaIva, email, password, profileImage, codeSdi, address, companyName } = req.body;

  try {
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: 'Utente non trovato' });
      }

      user.name = name;
      user.partitaIva = partitaIva;
      user.email = email;
      user.password = password;
      user.profileImage = profileImage;
      user.codeSdi = codeSdi;
      user.address = address;
      user.companyName = companyName;

      await user.save();

      return res.status(200).json({ message: 'Dati utente aggiornati con successo', user: user, success: true });
  } catch (error) {
      console.error('Errore durante l\'aggiornamento dei dati utente:', error);
      return res.status(500).json({ message: 'Errore durante l\'aggiornamento dei dati utente', success: false });
  }
};

module.exports = { register, login, getUserInfo, addCandidate, getCandidateInfo, googleLogin, changeStatusCandidate, modifyUserData }
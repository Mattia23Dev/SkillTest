import axiosInstance from ".";

export const addExam = async(payload) => {
    try{
       const response = await axiosInstance.post('/api/exams/addExam',payload)
       return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const addExamMix = async(payload) => {
    try{
       const response = await axiosInstance.post('/api/exams/addExamMix',payload)
       return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const modificaExam = async(payload) => {
    try{
       const response = await axiosInstance.post('/api/exams/modificaExam',payload)
       return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const updateCandidatePref = async(payload) => {
    try{
       const response = await axiosInstance.post('/api/exams/updateCandidatePref',payload)
       return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const updateCandidateNotes = async(payload) => {
    try{
       const response = await axiosInstance.post('/api/exams/updateCandidateNotes',payload)
       return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const getAllExams = async() => {
    try{
       const response = await axiosInstance.get('/api/exams/getAllExams')
       return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const getExamById = async(id) => {
    try{
       const response = await axiosInstance.get(`/api/exams/getExamById/${id}`)
       return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const getExamByUser = async(id) => {
    try{
       const response = await axiosInstance.get(`/api/exams/getAllExamsByUser/${id}`)
       return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const getCandidateCrm = async(id) => {
    try{
       const response = await axiosInstance.get(`/api/exams/getCandidateCrm/${id}`)
       return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const editExam = async(payload,id) => {
    try{
      const response = await axiosInstance.put(`/api/exams/editExam/${id}`,payload)
      return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const deleteExam = async(id) => {
    try{
      const response = await axiosInstance.delete(`/api/exams/deleteExam/${id}`)
      return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const addQuestionToExam = async(payload,id) => {
    try{
        const response = await axiosInstance.post(`/api/exams/addQuestionToExam/${id}`,payload)
        return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const editQuestionInExam = async(payload,id) => {
    try{
        const response = await axiosInstance.put(`/api/exams/editQuestionInExam/${id}`,payload)
        return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const deleteQuestionFromExam = async(id,payload) => {
    try{
        const response = await axiosInstance.delete(`/api/exams/deleteQuestionFromExam/${id}`,payload)
        return response.data
    }
    catch(error){
        return error.response.data
    }
}

export const addCandidate = async (payload) => {
    try {
      const response = await axiosInstance.post('/api/users/add-candidate', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data; 
    } catch (error) {
      return error.response.data;
    }
  };

 export const saveTestProgress = async (payload) => {
    try {
      const response = await axiosInstance.put('/api/exams/save-test-progress', payload);
      return response.data
    } catch (error) {
      return error
    }
  };

  export const saveTestProgressMix = async (payload) => {
    try {
      const response = await axiosInstance.put('/api/exams/save-test-progress-mix', payload);
      return response.data
    } catch (error) {
      return error
    }
  };
  
  export const addTrackLink = async(payload) => {
    try{
        const response = await axiosInstance.post(`/api/exams/addTrackLink`,payload)
        return response.data
    }
    catch(error){
        return error.response
    }
}

export const deleteTrackLink = async(payload) => {
    try{
        const response = await axiosInstance.post(`/api/exams/deleteTrackLink`,payload)
        return response.data
    }
    catch(error){
        return error.response
    }
}

export const changeCandidateStatus = async(payload) => {
    try{
        const response = await axiosInstance.post(`/api/users/changeCandidateStatus`,payload)
        return response.data
    }
    catch(error){
        return error.response
    }
}

export const changeStatusExam = async(payload) => {
    try{
        const response = await axiosInstance.post(`/api/exams/changeStatusExam`,payload)
        return response.data
    }
    catch(error){
        return error.response
    }
}
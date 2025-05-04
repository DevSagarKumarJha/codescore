import axios from "axios";

const sleep = (ms) => new Promise((resolve)=> setTimeout(resolve, ms))

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    JAVA: 62,
    JAVASCRIPT: 63,
    PYTHON: 71,
  };
  return languageMap[language];
};

export const pollBatchresults = async (tokens) => {
  while (true) {
     const { data } = await axios.get(
       `${process.env.JUDGE0_URI}/submissions/batch`,
       {
         params: {
           tokens: tokens.join(","),
           base64_encoded: false,
         },
       }
     );

    const results = data.submissions;

    const isAllDone = results.every((result) => result.status.id >= 3);

    if(isAllDone){
      return results;
    }

    await sleep(1000);
  }
};

export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_URI}/submissions/batch?base64_encoded=false`,
    {
      submissions,
    }
  );

  return data;
};

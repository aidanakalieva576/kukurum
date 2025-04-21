const translateWithHuggingFace = async (text) => {
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          src_lang: "eng_Latn",
          tgt_lang: "rus_Cyrl"
        }
      })
    });
  
    const result = await response.json();
    return result[0]?.translation_text;
  };
  
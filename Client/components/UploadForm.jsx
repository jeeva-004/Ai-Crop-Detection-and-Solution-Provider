import { useState } from "react";
import axios from "axios";

function UploadForm() {
  const [image, setImage] = useState(null);
  const [language, setLanguage] = useState("Tamil");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("image", image);
    formData.append("language", language);

    const res = await axios.post(
      "http://localhost:5000/routes/predict",
      formData
    );

    setResult(res.data);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} required />
        <select onChange={(e) => setLanguage(e.target.value)}>
          <option>Tamil</option>
          <option>Hindi</option>
          <option>English</option>
        </select>
        <button type="submit">Predict</button>
      </form>

      {result && (
        <div>
          <h3>Disease: {result.disease}</h3>
          <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
          <p><b>Treatment:</b> {result.treatment}</p>
        </div>
      )}
    </>
  );
}

export default UploadForm;

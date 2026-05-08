import { useState } from 'react';
import './App.css';

const PRESIGNED_URL_API = 'https://1pyj788lnk.execute-api.us-east-1.amazonaws.com/default/generatePresignedUrl';
const SUBMIT_JOB_API = 'https://5vwh2kke1i.execute-api.us-east-1.amazonaws.com/default/submitJob';

function App() {
  const [fullName, setFullName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setStatus('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setStatus('Please enter your full name.');
      return;
    }

    if (!selectedFile) {
      setStatus('Please select a file.');
      return;
    }

    const fileName = selectedFile.name.trim();

    if (!fileName.toLowerCase().endsWith('.input')) {
      setStatus(`Please select a file ending with ".input". Selected file: ${selectedFile.name}`);
      return;
    }

    const contentType = selectedFile.type || 'application/octet-stream';

    try {
      setIsSubmitting(true);
      setStatus('Requesting upload URL...');

      const uploadUrlResponse = await fetch(PRESIGNED_URL_API, {
        method: 'POST',
        body: JSON.stringify({
          fileName,
          contentType,
        }),
      });

      if (!uploadUrlResponse.ok) {
        throw new Error(`Upload URL request failed: ${uploadUrlResponse.status}`);
      }

      const { uploadUrl, key } = await uploadUrlResponse.json();

      if (!uploadUrl) {
        throw new Error('Backend response did not include an uploadUrl.');
      }

      setStatus('Uploading file to S3...');

      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: selectedFile,
      });

      if (!s3Response.ok) {
        throw new Error(`S3 upload failed: ${s3Response.status}`);
      }

      setStatus('Saving job metadata to DynamoDB...');

      const submitResponse = await fetch(SUBMIT_JOB_API, {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          inputFilePath: key,
        }),
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to save job metadata.');
      }

      const submitData = await submitResponse.json();

      setStatus(`Upload and job submission successful! Job ID: ${submitData.job.id}`);
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('Upload failed. Please check the browser console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="App">
      <section className="upload-panel" aria-labelledby="upload-title">
        <div className="upload-header">
          <p className="eyebrow">Fovus Upload</p>
          <h1 id="upload-title">Upload Input File</h1>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="YourFullName"
              autoComplete="name"
            />
          </label>

          <label className="field">
            <span>Input file</span>
            <input type="file" onChange={handleFileChange} />
            {selectedFile && (
              <span className="selected-file">Selected: {selectedFile.name}</span>
            )}
          </label>

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Uploading...' : 'Submit'}
          </button>
        </form>

        <div className="status-message" role="status" aria-live="polite">
          {status || 'Ready to upload a .input file.'}
        </div>
      </section>
    </main>
  );
}

export default App;

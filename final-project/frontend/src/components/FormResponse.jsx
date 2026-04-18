function FormResponse({ loading, successMessage, apiResponse }) {
  if (!loading && !successMessage && !apiResponse) {
    return null;
  }

  return (
    <section className="response-panel">
      {successMessage && <p className="success-message">{successMessage}</p>}

      {loading && <p>Sending data... ⏳</p>}

      {apiResponse && (
        <div className="response-card">
          <h2>Server Response</h2>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}

export default FormResponse;
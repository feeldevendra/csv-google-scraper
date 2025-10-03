document.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('uploadBtn');
  const startBtn = document.getElementById('startBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const csvFile = document.getElementById('csvFile');
  const throttleInput = document.getElementById('throttle');
  const resultsTableBody = document.querySelector('#resultsTable tbody');

  let rows = [];
  let results = [];

  uploadBtn.addEventListener('click', () => {
    const file = csvFile.files[0];
    if (!file) return alert('Please select a CSV file.');

    Papa.parse(file, {
      header: true,
      complete: (parsed) => {
        rows = parsed.data.filter(row => row.Company && row.Country);
        if (rows.length === 0) return alert('CSV must have Company and Country columns.');
        startBtn.disabled = false;
        alert(`${rows.length} rows loaded.`);
      }
    });
  });

  startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    const throttle = parseInt(throttleInput.value) * 1000;
    chrome.runtime.sendMessage({ action: 'startScraping', rows, throttle });
  });

  downloadBtn.addEventListener('click', () => {
    const csvContent = Papa.unparse(results);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename: 'scraped_results.csv' });
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateResult') {
      results.push(message.result);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${message.result.Company || ''}</td>
        <td>${message.result.Country || ''}</td>
        <td>${message.result.name || ''}</td>
        <td>${message.result.email || ''}</td>
        <td>${message.result.phone1 || ''}</td>
        <td>${message.result.phone2 || ''}</td>
        <td>${message.result.website || ''}</td>
        <td>${message.result.status || ''}</td>
      `;
      resultsTableBody.appendChild(row);

      if (results.length === rows.length) {
        downloadBtn.disabled = false;
        alert('Scraping complete!');
      }
    }
  });
});

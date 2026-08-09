import http from 'http';

http.get('http://localhost:3001/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    if (data.includes("Imani's")) {
      console.log('SUCCESS: Imani\'s homepage is rendering live on http://localhost:3001!');
    } else {
      console.log('Output snippet:', data.substring(0, 300));
    }
  });
}).on('error', (err) => {
  console.log('Error fetching localhost:', err.message);
});

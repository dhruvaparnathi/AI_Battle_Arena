import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});



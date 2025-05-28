const { Pool } = require('pg'); 


const pool = new Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com', 
  port: 5432, 
  user: 'postgres.veeadntqearsiehxffxy', 
  password: '123456789', 
  database: 'postgres', 
  ssl: {
    rejectUnauthorized: false
  }
});


pool.connect((err, client, release) => {
  if (err) {
    console.error('Error conectando con la base de datos', err.stack); 
  } else {
    console.log('Conectado a la base de datos'); 
    release(); 
  }
});

module.exports = pool; 
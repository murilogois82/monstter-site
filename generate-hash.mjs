import bcrypt from 'bcrypt';

const password = 'admin';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erro ao gerar hash:', err);
    process.exit(1);
  }
  console.log(`Hash para senha "${password}": ${hash}`);
  console.log('\nUse este hash no banco de dados');
});

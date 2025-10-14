const StellarSdk = require('@stellar/stellar-sdk');

// Array para guardar la información de las cuentas
const cuentas = [];

// Bucle para crear 5 cuentas
for (let i = 1; i <= 5; i++) {
    console.log(`Creando cuenta ${i}...`);

    // Genera un par de claves
    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    // Fondea la cuenta con Friendbot (red de prueba)
    const friendbotUrl = `https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`;
    fetch(friendbotUrl)
        .then(response => response.text())
        .then(() => {
            console.log(`Cuenta ${i} fondeada con éxito.`);
            console.log(`Clave pública ${i}: ${publicKey}`);
            console.log(`Clave secreta ${i}: ${secretKey}`);

            // Verifica el saldo usando Horizon
            const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
            return server.loadAccount(publicKey);
        })
        .then(account => {
            const balance = account.balances.find(b => b.asset_type === 'native').balance;
            console.log(`Saldo inicial de cuenta ${i}: ${balance} XLM`);

            // Guarda la información en el array
            cuentas.push({
                numero: i,
                publicKey: publicKey,
                secretKey: secretKey,
                saldoInicial: balance
            });
        })
        .catch(error => {
            console.error(`Error en cuenta ${i}:`, error.message);
        });
}

// Muestra el array completo al final
setTimeout(() => {
    console.log('Información de todas las cuentas:', cuentas);
}, 5000); // Espera 5 segundos para que todas las peticiones se completen
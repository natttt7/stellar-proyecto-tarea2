require('dotenv').config({ path: '../.env' });
const StellarSdk = require('@stellar/stellar-sdk');

// CONFIGURACIÓN
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Cargar claves desde .env
const sourceKeypair = StellarSdk.Keypair.fromSecret(process.env.SOURCE_SECRET);
const destinatarios = [
  { publicKey: process.env.DEST_1, memo: 'Pago-001' },
  { publicKey: process.env.DEST_2, memo: 'Pago-002' },
  { publicKey: process.env.DEST_3, memo: 'Pago-003' }
];

async function enviarPago(destPublicKey, amount, memoText) {
  try {
    console.log('🚀 Iniciando pago...\n');
    console.log('Paso 1: Cargar mi cuenta');

    // Cargar cuenta fuente
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    console.log(`Balance actual: ${sourceAccount.balances.find(b => b.asset_type === 'native').balance} XLM\n`);

    // Construir transacción
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: networkPassphrase
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: destPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString()
      }))
      .addMemo(StellarSdk.Memo.text(memoText))
      .setTimeout(30)
      .build();

    // Firmar transacción
    transaction.sign(sourceKeypair);

    // Enviar a la red
    const result = await server.submitTransaction(transaction);
    
    console.log('🎉 ¡PAGO EXITOSO!\n');
    console.log(`💰 Enviaste: ${amount} XLM a ${destPublicKey}`);
    console.log(`🔗 Hash: ${result.hash}\n`);
    
    return result;
  } catch (error) {
    console.error('❌ ERROR en pago a', destPublicKey, ':', error.message);
    throw error;
  }
}

// Función para enviar pagos a múltiples destinatarios
async function enviarVariosPagos() {
  for (const dest of destinatarios) {
    try {
      await enviarPago(dest.publicKey, '2', dest.memo);
      console.log(`✅ Transacción completada para ${dest.publicKey}\n`);
    } catch (error) {
      console.error(`❌ Fallo en pago a ${dest.publicKey}:`, error.message);
      break; // Detener si falla una transacción
    }
  }
  console.log('Todos los pagos procesados.');
}

// Ejecutar el proceso
enviarVariosPagos();
// consultar-balance.js
import { Horizon } from '@stellar/stellar-sdk';

// Configuración
const server = new Horizon.Server('https://horizon-testnet.stellar.org');

// Array de public keys
const PUBLIC_KEYS = [
  'GB6YDJWDYLZHAQR7Y3PA4E7JMBBOA2YZUEN24RYIVHSMXI5JK6QVFWOI',
  'GBZOHAP36MLQYG4IMQITZLDLYQ6SUQZWTKLGMCP6IH7AC4VU5ZZGGVSP'
];

// Función principal
async function consultarBalance(publicKeys) {
  console.log('=== MONITOR DE CUENTAS ===');
  
  for (const publicKey of publicKeys) {
    try {
      const cuenta = await server.loadAccount(publicKey);
      
      // Obtener balance de XLM
      const balanceXLM = cuenta.balances.find(b => b.asset_type === 'native')?.balance || '0';
      
      // Contar trustlines activos (excluyendo XLM)
      const trustlines = cuenta.balances.filter(b => b.asset_type !== 'native').length;
      
      // Obtener sequence number
      const sequence = cuenta.sequence;

      // Mostrar resultado formateado
      console.log(`Cuenta: ${publicKey.slice(0, 6)}...${publicKey.slice(-3)}`);
      console.log(`  Balance: ${parseFloat(balanceXLM).toFixed(2)} XLM`);
      console.log(`  Trustlines: ${trustlines}`);
      console.log(`  Sequence: ${sequence}\n`);
    } catch (error) {
      console.log(`Error al consultar ${publicKey.slice(0, 6)}...${publicKey.slice(-3)}: ${error.message}\n`);
    }
  }
}

// Ejecutar la función
consultarBalance(PUBLIC_KEYS);
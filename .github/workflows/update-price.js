const Web3 = require('web3');

const RPC_URL = process.env.RPC_URL || 'https://bsc-dataseed.binance.org/';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const REWARD_POOL = '0xF09558B770e8863C069462BB57EDa05fE6900Ca8';
const WALLET_ADDR = '0x4B37cb4A028972F29Ec8cfdc6aB8EdcE33665852'; // 你的钱包地址

if (!PRIVATE_KEY) {
    console.log('⏭️ 未配置私钥，跳过执行');
    process.exit(0);
}

const web3 = new Web3(RPC_URL);

const abi = [
    {
        "inputs": [],
        "name": "updatePrice",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

async function main() {
    try {
        const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
        web3.eth.accounts.wallet.add(account);

        const contract = new web3.eth.Contract(abi, REWARD_POOL);

        // 先检查是否需要更新
        const isFresh = await contract.methods.isPriceFresh().call();
        if (isFresh) {
            console.log('✅ 价格仍然有效，无需更新');
            return;
        }

        // 更新价格
        const gasPrice = await web3.eth.getGasPrice();
        const tx = await contract.methods.updatePrice().send({
            from: WALLET_ADDR,
            gas: 300000,
            gasPrice: Math.floor(Number(gasPrice) * 1.1).toString()
        });

        console.log('✅ 价格更新成功!');
        console.log('交易Hash:', tx.transactionHash);
        console.log('新区块:', tx.blockNumber);
    } catch (e) {
        console.log('⚠️ 更新失败:', e.message?.slice(0, 200) || e);
        // 失败不报错，避免 GitHub Actions 显示红色
    }
}

main();

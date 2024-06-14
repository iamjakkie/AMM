const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('AMM', () => {
    let accounts, deployer, liquidityProvider, token1, token2, amm

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        liquidityProvider = accounts[1]

        const Token = await ethers.getContractFactory('Token')
        token1 = await Token.deploy('MyToken', 'MTKN', '1000000')
        token2 = await Token.deploy('USD Token', 'USDt', '1000000')

        

        const AMM = await ethers.getContractFactory('AMM')
        amm = await AMM.deploy(token1.address, token2.address)
    })
    describe('Deployment', () => {
        it('Has an address', async () => {
            expect(amm.address).to.not.equal(0x0)
        })

        it('Returns token1', async () => {
            expect(await amm.token1()).to.equal(token1.address)
        })

        it('Returns token2', async () => {
            expect(await amm.token2()).to.equal(token2.address)
        })
    })

    describe('Add Liquidity', () => {
        it('')
    })
})
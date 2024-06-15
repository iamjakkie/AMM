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

        let transaction = await token1.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
        await transaction.wait()
        transaction = await token2.connect(deployer).transfer(liquidityProvider.address, tokens(100000))
        await transaction.wait()

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
        let amount, transaction, result
        it('Swap', async () => {
            amount = tokens(100000)
            transaction = await token1.connect(deployer).approve(amm.address, amount)
            await transaction.wait()

            transaction = await token2.connect(deployer).approve(amm.address, amount)
            await transaction.wait()

            transaction = await amm.connect(deployer).addLiquidity(amount, amount)
            await transaction.wait()

            expect(await token1.balanceOf(amm.address)).to.equal(amount)
            expect(await token2.balanceOf(amm.address)).to.equal(amount)

            expect(await amm.token1Balance()).to.equal(amount)
            expect(await amm.token2Balance()).to.equal(amount)

            expect(await amm.K()).to.equal(amount.mul(amount))

            expect(await amm.shares(deployer.address)).to.equal(tokens(100))

            expect(await amm.totalShares()).to.equal(tokens(100))

            amount = tokens(50000)
            transaction = await token1.connect(liquidityProvider).approve(amm.address, amount)
            await transaction.wait()

            transaction = await token2.connect(liquidityProvider).approve(amm.address, amount)
            await transaction.wait()

            transaction = await amm.connect(liquidityProvider).addLiquidity(amount, amount)
            await transaction.wait()

            expect(await amm.shares(liquidityProvider.address)).to.equal(tokens(50))
            expect(await amm.shares(deployer.address)).to.equal(tokens(100))
            expect(await amm.totalShares()).to.equal(tokens(150))

            
        })
    })
})
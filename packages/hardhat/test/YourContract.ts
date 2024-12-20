import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  let yourContract: YourContract;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const YourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = await YourContractFactory.deploy(owner.address); // Убираем вызов deployed()
  });

  it("Should mint a new NFT for the caller", async function () {
    const name = "Test NFT";
    const description = "This is a test NFT";
    const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png";

    // Mint NFT as addr1
    await yourContract.connect(addr1).safeMint(name, description, imageUrl);

    const tokenData = await yourContract.tokens(0);
    expect(tokenData.name).to.equal(name);
    expect(tokenData.description).to.equal(description);
    expect(tokenData.imageUrl).to.equal(imageUrl);
    expect(tokenData.owner).to.equal(addr1.address); // Проверяем, что владелец - вызывающий
  });

  it("Should emit TokenMinted event", async function () {
    const name = "Test NFT";
    const description = "This is a test NFT";
    const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png";

    // Mint NFT as addr1
    await expect(yourContract.connect(addr1).safeMint(name, description, imageUrl))
      .to.emit(yourContract, "TokenMinted")
      .withArgs(0, addr1.address, name, description, imageUrl);
  });

  it("Should return all tokens", async function () {
    const name1 = "Test NFT 1";
    const description1 = "This is a test NFT 1";
    const imageUrl1 = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png";

    const name2 = "Test NFT 2";
    const description2 = "This is a test NFT 2";
    const imageUrl2 = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png";

    // Mint NFTs as different users
    await yourContract.connect(addr1).safeMint(name1, description1, imageUrl1);
    await yourContract.connect(addr2).safeMint(name2, description2, imageUrl2);

    const allTokens = await yourContract.getAllTokens();
    expect(allTokens.length).to.equal(2);
    expect(allTokens[0].name).to.equal(name1);
    expect(allTokens[1].name).to.equal(name2);
  });

  it("Should allow any user to mint an NFT", async function () {
    const name = "Test NFT";
    const description = "This is a test NFT";
    const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png";

    // Mint NFT as addr2
    await yourContract.connect(addr2).safeMint(name, description, imageUrl);

    const tokenData = await yourContract.tokens(0);
    expect(tokenData.owner).to.equal(addr2.address); // Проверяем, что владелец - addr2
  });

  it("Should increment token ID correctly", async function () {
    const name1 = "Test NFT 1";
    const description1 = "This is a test NFT 1";
    const imageUrl1 = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png";

    const name2 = "Test NFT 2";
    const description2 = "This is a test NFT 2";
    const imageUrl2 = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png";

    // Mint two NFTs
    await yourContract.connect(addr1).safeMint(name1, description1, imageUrl1);
    await yourContract.connect(addr2).safeMint(name2, description2, imageUrl2);

    const token1 = await yourContract.tokens(0);
    const token2 = await yourContract.tokens(1);

    expect(token1.owner).to.equal(addr1.address);
    expect(token2.owner).to.equal(addr2.address);
  });
});
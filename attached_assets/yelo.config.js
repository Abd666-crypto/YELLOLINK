describe('YeloLink', () => {
  let contract;

  before(async () => {
    contract = await deployContract();
  });

  it('Registers a driver', async () => {
    await contract.registerDriver('GT-1234');
    const driver = await contract.drivers(owner.address);
    expect(driver.licensePlate).to.equal('GT-1234');
  });
});
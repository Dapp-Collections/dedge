import { ethers } from "ethers";
import { BigNumber } from "ethers/utils/bignumber";

import dedgeMakerManagerDef from "../artifacts/DedgeMakerManager.json";
import { legos } from "money-legos";

import { Address } from "./types";
import { getCustomGasPrice } from "./common";

const IDssProxyActions = new ethers.utils.Interface(
  legos.maker.dssProxyActions.abi
);
const IDedgeMakerManager = new ethers.utils.Interface(dedgeMakerManagerDef.abi);

const getVaultIds = async (
  userProxy: Address,
  dssCdpManager: ethers.Contract
): Promise<number[]> => {
  const cdpCountBN: BigNumber = await dssCdpManager.count(userProxy);
  const cdpCount: number = parseInt(cdpCountBN.toString(), 10);

  if (cdpCount === 0) {
    return [];
  }

  // Get last vault to get the 2nd last vault, and so on
  const cdpIds = [];
  let lastCdpId: BigNumber = await dssCdpManager.last(userProxy);
  cdpIds.push(parseInt(lastCdpId.toString(), 10));

  // Vault Id is stored in a linked-list like fashion
  for (let i = 1; i < cdpCount; i++) {
    const linkedListRet = await dssCdpManager.list(lastCdpId.toString());
    lastCdpId = linkedListRet.prev.toString();
    cdpIds.push(parseInt(lastCdpId.toString(), 10));
  }

  return cdpIds;
};

const isUserAllowedVault = async (
  user: Address,
  cdpId: number,
  dssCdpManager: ethers.Contract
) => {
  const owner = await dssCdpManager.owns(cdpId.toString());
  const cdpCan = await dssCdpManager.cdpCan(owner, cdpId.toString(), user);

  return owner === user || cdpCan.toString() === "1";
};

const importMakerVault = async (
  dacProxy: ethers.Contract,
  dedgeMakerManager: Address,
  addressRegistry: Address,
  cdpId: number,
  ilkCTokenEquilavent: Address,
  ilkJoinAddress: Address,
  decimalPlaces: number = 18,
  overrides: any = { gasLimit: 2000000 }
): Promise<any> => {
  // struct ImportMakerVaultCallData {
  //     address addressRegistryAddress;
  //     uint cdpId;
  //     address collateralCTokenAddress;
  //     address collateralJoinAddress;
  //     uint8 collateralDecimals;
  // }
  const gasPrice = await getCustomGasPrice(dacProxy.provider);

  const importMakerVaultPostLoanData = ethers.utils.defaultAbiCoder.encode(
    ["address", "uint", "address", "address", "uint8"],
    [
      addressRegistry,
      cdpId.toString(),
      ilkCTokenEquilavent,
      ilkJoinAddress,
      decimalPlaces.toString(),
    ]
  );

  const executeOperationCalldataParams = IDedgeMakerManager.functions.importMakerVaultPostLoan.encode(
    [
      0,
      0,
      0, // Doesn't matter as the variables will be re-injected by `executeOption` anyway
      importMakerVaultPostLoanData,
    ]
  );

  const importMakerVaultCallbackdata = IDedgeMakerManager.functions.importMakerVault.encode(
    [
      dedgeMakerManager,
      dacProxy.address,
      addressRegistry,
      cdpId,
      executeOperationCalldataParams,
    ]
  );

  return dacProxy.execute(
    dedgeMakerManager,
    importMakerVaultCallbackdata,
    Object.assign({ gasPrice }, overrides)
  );
};

const dsProxyCdpAllowDacProxy = (
  dsProxy: ethers.Contract, // MakerDAO's / InstaDapp's proxy contract
  dacProxy: Address, // Dedge's proxy contract
  dssCdpManager: Address, // DssCdpManager's address,
  dssProxyActions: Address, // Dss-ProxyAction's address
  cdpId: number,
  overrides: any = { gasLimit: 750000 }
): Promise<any> => {
  const allowDacProxyCallback = IDssProxyActions.functions.cdpAllow.encode([
    dssCdpManager,
    cdpId.toString(),
    dacProxy,
    "1",
  ]);

  return dsProxy.execute(dssProxyActions, allowDacProxyCallback, overrides);
};

export default {
  importMakerVault,
  dsProxyCdpAllowDacProxy,
  getVaultIds,
  isUserAllowedVault,
};

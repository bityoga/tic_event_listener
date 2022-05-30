const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { stringify } = require("querystring");

const APP_CONFIG_FILE = "app_config.json";
const USECASE_CHAINCODE_CONFIG_FILE = "useCaseChainCodeConfig.json";
const MAPPED_CHAINCODE_USE_CASE_FILE =
  "./hlft-store/tic_dashboard/mapUsecaseChaincode.json";
// Global variable to store the api config from file
let appConfigJson;
let useCaseChainCodeConfigJson;
let mapConfigJson;
// Load api config from json file
function updateAppConfigJsonGlobalVariableWithLatestChangesFromFile() {
  try {
    const apiConfigFilePath = path.resolve(__dirname, ".", APP_CONFIG_FILE);
    //console.log(apiConfigFilePath);
    const apiConfigFileContent = fs.readFileSync(apiConfigFilePath, "utf8");
    appConfigJson = JSON.parse(apiConfigFileContent);
    //console.log(appConfigJson);
  } catch (e) {
    console.log(e);
    throw Error("API Start Error - Error while reading API config", e);
  }
}
// Load api config from json file
function updateMapConfigJsonGlobalVariableWithLatestChangesFromFile() {
  try {
    const mapConfigFilePath = path.resolve(
      __dirname,
      ".",
      MAPPED_CHAINCODE_USE_CASE_FILE
    );
    //console.log(mapConfigFilePath);
    const mapConfigFileContent = fs.readFileSync(mapConfigFilePath, "utf8");
    mapConfigJson = JSON.parse(mapConfigFileContent);
    console.log("mapConfigJson");
    console.log(mapConfigJson);
  } catch (e) {
    console.log(e);
    throw Error("API Start Error - Error while reading Map config", e);
  }
}
// Load api config from json file
function updateUseCaseChainCodeConfigJsonGlobalVariableWithLatestChangesFromFile() {
  try {
    const useCaseChainCodeConfigFilePath = path.resolve(
      __dirname,
      ".",
      USECASE_CHAINCODE_CONFIG_FILE
    );
    //console.log(apiConfigFilePath);
    const useCaseChainCodeConfigFileContent = fs.readFileSync(
      useCaseChainCodeConfigFilePath,
      "utf8"
    );
    useCaseChainCodeConfigJson = JSON.parse(useCaseChainCodeConfigFileContent);
    console.log(typeof useCaseChainCodeConfigJson);
  } catch (e) {
    console.log(e);
    throw Error(
      "API Start Error - Error while reading useCaseChainCodeConfigJson file",
      e
    );
  }
}
updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
updateUseCaseChainCodeConfigJsonGlobalVariableWithLatestChangesFromFile();
function getLastPushedBlockNumberFromFile(networkName, channelName) {
  let returnValue = null;
  const networkList = appConfigJson["last_pushed_block_info"];
  for (network of networkList) {
    if (networkName in network) {
      const channelList = network[networkName];
      for (networkChannel of channelList) {
        if (channelName in networkChannel) {
          returnValue = networkChannel[channelName]["lastPushedBlockNumber"];
        }
      }
    }
  }
  return returnValue;
}

function addNewNetworkChannelLastPushedDefaultBlockNumberZeroToFile(
  networkName,
  channelName
) {
  let newNetworkInfo = {};
  let newChannelInfo = {};
  newChannelInfo[channelName] = {
    lastPushedBlockNumber: 0,
  };
  newNetworkInfo[networkName] = [newChannelInfo];

  const newLastPusheChannelInfoOnly = {
    channelName: {
      lastPushedBlockNumber: 0,
    },
  };

  let netWorkExists = false;

  let netWorkIndex;

  const networkList = appConfigJson["last_pushed_block_info"];

  for (let i = 0; i < networkList.length; i++) {
    if (networkName in networkList[i]) {
      netWorkExists = true;
      netWorkIndex = i;
    }
  }

  if (!netWorkExists) {
    appConfigJson["last_pushed_block_info"].push(newNetworkInfo);
  } else {
    appConfigJson["last_pushed_block_info"][netWorkIndex][networkName].push(
      newChannelInfo
    );
  }
}

function getLastPushedBlockNumber(networkName, channelName) {
  let lasInsertedBlockNumber = getLastPushedBlockNumberFromFile(
    networkName,
    channelName
  );
  if (lasInsertedBlockNumber === null) {
    addNewNetworkChannelLastPushedDefaultBlockNumberZeroToFile(
      networkName,
      channelName
    );

    fs.writeFileSync(APP_CONFIG_FILE, JSON.stringify(appConfigJson, null, 2));

    //console.log(getLastPushedBlockNumberFromFile(networkName, channelName));
    return 0;
  } else {
    console.log(lasInsertedBlockNumber);
    return lasInsertedBlockNumber;
  }
}

function writeLastPushedBlockNumberToFile(
  lastPushedBlockNumber,
  networkName,
  channelName
) {
  let returnValue = null;
  const networkList = appConfigJson["last_pushed_block_info"];
  let networkIndex;
  let channelIndex;
  for (let i = 0; i < networkList.length; i++) {
    if (networkName in networkList[i]) {
      networkIndex = i;
      const channelList = networkList[i][networkName];
      for (let j = 0; j < channelList.length; j++) {
        if (channelName in channelList[j]) {
          channelIndex = j;
        }
      }
    }
  }
  appConfigJson["last_pushed_block_info"][networkIndex][networkName][
    channelIndex
  ][channelName]["lastPushedBlockNumber"] = lastPushedBlockNumber;
  fs.writeFileSync(APP_CONFIG_FILE, JSON.stringify(appConfigJson, null, 2));
}
/* console.log(appConfigJson); */
/* setInterval(async () => {
  //await fetch("https://www.google.com/")
  updateAppConfigJsonGlobalVariableFromFile();
  console.log("appConfigJson");
  console.log(appConfigJson);
}, 100);
 */

const HYPERLEDGER_EXPLORER_ACCESS_URL = "http://161.35.153.83:8090";
const ARTICONF_SMART_API_AUTHENTICATION_ACCESS_ACCESS_URL =
  "https://articonf1.itec.aau.at:30401";
const ARTICONF_SMART_API_USECASE_ACCESS_URL =
  "https://articonf1.itec.aau.at:30420";
const ARTICONF_SMART_API_BLOCKCHAIN_TRACE_RETRIEVAL_ACCESS_URL =
  "https://articonf1.itec.aau.at:30001";

async function getHlfExplorerAuthenticationToken(networkName) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let hlfExplorerAuthorisationToken = null;
  try {
    const authenticationCredentials = {
      user:
        appConfigJson["hyperledger_explorer_rest_api_authentication_user_name"],
      password:
        appConfigJson[
          "hyperledger_explorer_rest_api_authentication_user_password"
        ],
      network: networkName,
    };

    const axiosRequest = {
      method: "post",
      url: appConfigJson["HYPERLEDGER_EXPLORER_ACCESS_URL"] + "/auth/login",
      // To bypass  "Error: self signed certificate in certificate chain"
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      headers: {},
      data: authenticationCredentials,
    };

    const response = await axios(axiosRequest);
    //console.log(response.data);
    if (response["data"]["success"] === true) {
      hlfExplorerAuthorisationToken = response["data"]["token"];
    }
  } catch (error) {
    console.error("getHlfExplorerAuthenticationToken() Error :", error);
  } finally {
    return hlfExplorerAuthorisationToken;
  }
}

async function getSmartApiAuthenticationToken() {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  //console.log("inside getSmartApiAuthenticationToken");
  let smartApiAuthorizationToken = null;
  try {
    const smartApiAuthenticationCredentials = {
      username: appConfigJson["smart_rest_api_authentication_user_name"],
      password: appConfigJson["smart_rest_api_authentication_user_password"],
    };

    const axiosRequest = {
      method: "post",
      url:
        appConfigJson["ARTICONF_SMART_API_AUTHENTICATION_ACCESS_ACCESS_URL"] +
        "/api/tokens",
      // To bypass  "Error: self signed certificate in certificate chain"
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      headers: {
        /*"Content-Type": "text/plain",*/
      },

      data: smartApiAuthenticationCredentials,
    };

    const response = await axios(axiosRequest);
    //console.log(response);
    //console.log(response.data);

    smartApiAuthorizationToken = response["data"]["token"];
  } catch (error) {
    console.error("getHlfExplorerAuthenticationToken() Error :", error);
  } finally {
    console.log("smartApiAuthorizationToken");
    console.log(smartApiAuthorizationToken);
    return smartApiAuthorizationToken;
  }
}

async function sendTransactionDataToSmart(transactionData) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  console.log("inside sendTransactionData", transactionData);
  let sendTransactionDataToSmartResponse = null;
  try {
    const authenticationToken = await getSmartApiAuthenticationToken();

    //console.log(authenticationToken);

    if (authenticationToken) {
      const axiosRequest = {
        method: "POST",
        baseURL:
          appConfigJson["ARTICONF_SMART_API_AUTHENTICATION_ACCESS_ACCESS_URL"],
        url: "/api/trace",
        //To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + authenticationToken,
        },

        data: transactionData,
      };
      //console.log(axiosRequest);
      try {
        const response = await axios(axiosRequest);
        sendTransactionDataToSmartResponse = response.status;
      } catch (error) {
        console.log("axios error");
        sendTransactionDataToSmartResponse = error.response.status;
        console.log(error.response.status, error.response.data);
      }
    } else {
      console.log("smart api authentication token retrieval failed");
    }
  } catch (error) {
    console.error("sendTransactionDataToSmart() Error : ".error);
  } finally {
    console.log("sendTransactionDataToSmartResponse");
    console.log(sendTransactionDataToSmartResponse);
    return sendTransactionDataToSmartResponse;
  }
}

async function getPushedTransactionListFromSmartApi(useCaseName) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let transactionList = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken();
    if (smartAuthenticationToken) {
      var axiosRequest = {
        method: "get",
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        url:
          appConfigJson[
            "ARTICONF_SMART_API_BLOCKCHAIN_TRACE_RETRIEVAL_ACCESS_URL"
          ] +
          "/api/use_cases/" +
          useCaseName +
          "/transactions",
        headers: {
          Authorization: "Bearer " + smartAuthenticationToken,
        },
      };
      //console.log(axiosRequest);
      try {
        const response = await axios(axiosRequest);
        //console.log(response.data);
        transactionList = response.data;
      } catch (error) {
        console.log("axios error");
        console.log(error.response.status, error.response.data);
      }
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("getPushedTransactionListFromSmartApi() Error : ".error);
  } finally {
    console.log(transactionList);
    return transactionList;
  }
}

async function getUseCaseListFromSmartApi(passedAuthenticationToken) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let useCaseList = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken();

    if (smartAuthenticationToken) {
      let jwtToken;
      if (passedAuthenticationToken) {
        jwtToken = passedAuthenticationToken;
      } else {
        jwtToken = smartAuthenticationToken;
      }
      var axiosRequest = {
        method: "get",
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        url:
          appConfigJson["ARTICONF_SMART_API_USECASE_ACCESS_URL"] +
          "/api/use-cases",
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
      };
      //console.log(axiosRequest);
      const response = await axios(axiosRequest);
      //console.log(response.data);
      useCaseList = response.data;
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("getUseCaseListFromSmartApi() Error : ".error);
  } finally {
    //console.log(useCaseList);
    return useCaseList;
  }
}
function checkIfUseCaseExists(useCaseList, useCaseNameToCheck) {
  return useCaseList.some(function (el) {
    return el.name === useCaseNameToCheck;
  });
}

async function getUseCaseTableListFromSmartApi(
  passedAuthenticationToken,
  useCaseName
) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let useCaseTableList = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken();

    if (smartAuthenticationToken) {
      let jwtToken;
      if (passedAuthenticationToken) {
        jwtToken = passedAuthenticationToken;
      } else {
        jwtToken = smartAuthenticationToken;
      }
      var axiosRequest = {
        method: "get",
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        url:
          appConfigJson["ARTICONF_SMART_API_USECASE_ACCESS_URL"] +
          "/api/use-cases/" +
          useCaseName +
          "/tables",
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
      };
      //console.log(axiosRequest);
      const response = await axios(axiosRequest);
      //console.log(response.data);
      useCaseTableList = response.data;
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("getUseCaseTableListFromSmartApi() Error : ".error);
  } finally {
    //console.log(useCaseTableList);
    return useCaseTableList;
  }
}
function checkIfUseCaseTableExists(useCaseTableList, tableNameToCheck) {
  return useCaseTableList.some(function (el) {
    return el.name === tableNameToCheck;
  });
}

async function createNewTableInUseCaseInSmart(
  useCaseName,
  tableName,
  tableMappings
) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let createNewUseCaseTableInSmartApiResponse = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken();
    if (smartAuthenticationToken) {
      const existingUseCaseTableList = await getUseCaseTableListFromSmartApi(
        smartAuthenticationToken,
        useCaseName
      );
      // console.log(existingUseCaseTableList);
      const useCaseTableExists = checkIfUseCaseTableExists(
        existingUseCaseTableList,
        tableName
      );
      console.log("useCaseTableExists ", useCaseTableExists);
      if (!useCaseTableExists) {
        var data = JSON.stringify({
          name: tableName,
          use_case: useCaseName,
          mappings: {
            UniqueID: "AssetId",
            id: "id",
            firstName: "firstName",
            lastName: "lastName",
            email: "email",
            phoneNumber: "phoneNumber",
            nin: "nin",
            TransactionMessage: "TransactionMessage",
            TransactionUnixTimestamp: "TransactionUnixTimestamp",
            TransactionIsoTimestamp: "TransactionIsoTimestamp",
            AssetId: "AssetId",
          },
        });
        const staticToken =
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJAaXRlYy5hYXUuYXQiLCJjcmVhdGVkX2F0IjoiMjAyMS0xMi0xNSAyMToyODo1Ny45MjE3ODgiLCJ2YWxpZF91bnRpbCI6IjIwMjEtMTItMTYgMjE6Mjg6NTcuOTIxNzg4In0.gp13LARYOduRFHSNk9dKl_9Vtehkg2CXQu_Wiez4ptc";
        var config = {
          method: "post",
          url:
            appConfigJson["ARTICONF_SMART_API_USECASE_ACCESS_URL"] +
            "/api/use-cases/" +
            useCaseName +
            "/tables",
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + smartAuthenticationToken,
          },
          data: tableMappings,
        };
        console.log(config);
        try {
          const axiosResponse = await axios(config);
          console.log(createNewUseCaseTableInSmartApiResponse);
          createNewUseCaseTableInSmartApiResponse = axiosResponse.status;
        } catch (error) {
          //console.log(Object.keys(error), error.message);
          console.log("axios error");
          createNewUseCaseTableInSmartApiResponse = error.response.status;
          console.log(error.response.status, error.response.data);
        }
      } else {
        console.log(
          "Create New Use Case Table: Use case '" +
            useCaseName +
            "' Table '" +
            tableName +
            "' already exists. So skipping ..."
        );
        createNewUseCaseTableInSmartApiResponse = 400;
      }
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("createNewTableInUseCaseInSmart() Error : ".error);
  } finally {
    console.log("createNewUseCaseTableInSmartApiResponse");
    console.log(createNewUseCaseTableInSmartApiResponse);
    return createNewUseCaseTableInSmartApiResponse;
  }
}

async function createNewUseCaseInSmart(useCaseName) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let createNewUseCaseInSmartApiResponse = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken();
    if (smartAuthenticationToken) {
      const existingUseCaseList = await getUseCaseListFromSmartApi(
        smartAuthenticationToken
      );
      // console.log(existingUseCaseList);
      const useCaseExists = checkIfUseCaseExists(
        existingUseCaseList,
        useCaseName
      );
      console.log("useCaseExists ", useCaseExists);
      if (!useCaseExists) {
        var data = JSON.stringify({ name: useCaseName });
        const staticToken =
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJAaXRlYy5hYXUuYXQiLCJjcmVhdGVkX2F0IjoiMjAyMS0xMi0xNSAyMToyODo1Ny45MjE3ODgiLCJ2YWxpZF91bnRpbCI6IjIwMjEtMTItMTYgMjE6Mjg6NTcuOTIxNzg4In0.gp13LARYOduRFHSNk9dKl_9Vtehkg2CXQu_Wiez4ptc";
        var config = {
          method: "post",
          url:
            appConfigJson["ARTICONF_SMART_API_USECASE_ACCESS_URL"] +
            "/api/use-cases?name=" +
            useCaseName,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + smartAuthenticationToken,
          },
          data: data,
        };
        console.log(config);
        try {
          const axiosResponse = await axios(config);
          console.log(createNewUseCaseInSmartApiResponse);
          createNewUseCaseInSmartApiResponse = axiosResponse.status;
        } catch (error) {
          //console.log(Object.keys(error), error.message);
          console.log("axios error");
          createNewUseCaseInSmartApiResponse = error.response.status;
          console.log(error.response.status, error.response.data);
        }
      } else {
        console.log(
          "Create New Use: Use case '" +
            useCaseName +
            "' already exists. So skipping ..."
        );
        createNewUseCaseInSmartApiResponse = 400;
      }
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("createNewUseCaseInSmart() Error : ".error);
  } finally {
    console.log("createNewUseCaseInSmartApiResponse");
    console.log(createNewUseCaseInSmartApiResponse);
    return createNewUseCaseInSmartApiResponse;
  }
}

async function getTransactionByTxIdHash(
  networkName,
  channelGenesisHash,
  txIdHash
) {
  let transactionInfo = null;
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken(
      networkName
    );

    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        url:
          appConfigJson["HYPERLEDGER_EXPLORER_ACCESS_URL"] +
          "/api/transaction/" +
          channelGenesisHash +
          "/" +
          txIdHash,
        headers: {
          Authorization: "Bearer " + authenticationToken,
        },
      };

      const response = await axios(axiosRequest);
      //console.log(response.data);
      transactionInfo = response.data.row;
    } else {
      console.log("authentication token retrieval failed");
    }
  } catch (error) {
    console.error("getTransactionByTxIdHash() Error : ".error);
  } finally {
    return transactionInfo;
  }
}

async function getBlockDetailsbyBlockNumber(
  networkName,
  channelGenesisHash,
  blockNumber
) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let blockDetails = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken(
      networkName
    );

    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        url:
          appConfigJson["HYPERLEDGER_EXPLORER_ACCESS_URL"] +
          "/api/block/" +
          channelGenesisHash +
          "/" +
          blockNumber,
        headers: {
          Authorization: "Bearer " + authenticationToken,
        },
      };

      const response = await axios(axiosRequest);
      //console.log(response.data);
      blockDetails = response.data;
    } else {
      console.log("authentication token retrieval failed");
    }
  } catch (error) {
    console.error("getBlockActivityList() Error : ".error);
  } finally {
    return blockDetails;
  }
}

async function getNetworkList() {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let networkList = null;
  try {
    const axiosRequest = {
      method: "get",
      url:
        appConfigJson["HYPERLEDGER_EXPLORER_ACCESS_URL"] + "/auth/networklist",
      headers: {},
    };
    const response = await axios(axiosRequest);
    networkList = response.data.networkList;
  } catch (error) {
    console.error("getNetworkList() Error : ".error);
  } finally {
    console.log("networkList");
    console.log(networkList);
    return networkList;
  }
}
async function getChannels(networkName) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let channelList = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken(
      networkName
    );
    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        url:
          appConfigJson["HYPERLEDGER_EXPLORER_ACCESS_URL"] +
          "/api/channels/info",
        headers: {
          Authorization: "Bearer " + authenticationToken,
        },
      };

      const response = await axios(axiosRequest);
      //console.log(response.data);
      channelList = response.data.channels;
    } else {
      console.log("authentication token retrieval failed");
    }
  } catch (error) {
    console.error("getChannels() Error : ".error);
  } finally {
    return channelList;
  }
}
async function getChannelStatus(networkName, channelGenesisHash) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  //console.log(channelGenesisHash);
  let channelStatus = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken(
      networkName
    );

    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        // To bypass  "Error: self signed certificate in certificate chain"
        // httpsAgent: new https.Agent({
        //   rejectUnauthorized: false,
        // }),
        url:
          appConfigJson["HYPERLEDGER_EXPLORER_ACCESS_URL"] +
          "/api/status/" +
          channelGenesisHash,
        headers: {
          Authorization: "Bearer " + authenticationToken,
        },
      };

      const response = await axios(axiosRequest);

      channelStatus = response.data;
    } else {
      console.log("authentication token retrieval failed");
    }
  } catch (error) {
    console.error("getBlockActivityList() Error : ".error);
  } finally {
    return channelStatus;
  }
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

async function parseTransactionInfoWritesAndSendToSmartApi(
  transactionId,
  transactionInfo
) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  updateUseCaseChainCodeConfigJsonGlobalVariableWithLatestChangesFromFile();
  //console.log(transactionInfo);
  for (writes of transactionInfo.write_set) {
    if (writes["chaincode"] !== "lscc") {
      const writeSet = writes["set"];
      const chainCodeName = writes["chaincode"];
      let useCaseName = chainCodeName;
      let docType = chainCodeName;
      //console.log(writeSet);
      for (write of writeSet) {
        console.log(write);
        const writeValueKeysArray = Object.keys(JSON.parse(write.value));
        console.log("writeValueKeysArray = ", writeValueKeysArray);
        const possibleUniqueKey = getKeyByValue(
          JSON.parse(write.value),
          write.key
        );
        console.log("possibleUniqueKey = ", possibleUniqueKey);
        if (write.value.length > 0) {
          write.value = JSON.parse(write.value);
          //console.log(typeof(write.value));
          if (typeof write.value !== "number") {
            if ("docType" in write.value) {
              docType = write.value["docType"];
            }
          }
        }

        let smarTApiSpecificData = {
          ApplicationType: useCaseName,
          docType: docType,
        };
        /*let transactionIdInfo = {
          transactionId: transactionId,
          createdt: transactionInfo.createdt,
          chainCodeName: chainCodeName,
        };
        let transactionInformation = {
          ...smarTApiSpecificData,
          ...transactionIdInfo,
          ...write,
        };
        console.log(transactionInformation);
        const createUseCaseResponse = await createNewUseCaseInSmart(useCaseName);

        const sendTransactionDataToSmartResponse = await sendTransactionDataToSmart(
          transactionInformation
        );
        console.log(createUseCaseResponse, sendTransactionDataToSmartResponse);*/

        let transactionWriteInformationValue = write.value;
        console.log(
          "transactionWriteInformationValue.length transactionWriteInformationValue"
        );
        console.log(
          transactionWriteInformationValue.length,
          transactionWriteInformationValue
        );

        if (transactionWriteInformationValue.length > 0) {
          transactionWriteInformationValue = JSON.parse(
            transactionWriteInformationValue
          );
          console.log(typeof transactionWriteInformationValue);
        } else {
          // empty string - so no need for JSON.parse;
          console.log(typeof transactionWriteInformationValue);
        }

        // let useCaseName = chainCodeName;
        // let smarTApiSpecificData = {
        //   ApplicationType: useCaseName,
        // };
        let transactionIdInfo = {
          transactionId: transactionId,
          chainCodeName: chainCodeName,
        };

        console.log(transactionWriteInformationValue);
        let createUseCaseResponse;
        updateMapConfigJsonGlobalVariableWithLatestChangesFromFile();
        if (useCaseName in mapConfigJson) {
          createUseCaseResponse = await createNewUseCaseInSmart(
            mapConfigJson[useCaseName]
          );
        } else {
          createUseCaseResponse = await createNewUseCaseInSmart(useCaseName);
        }
        let tableMappings;
        let transactionWriteInformationValueSchema = null;
        if (
          typeof transactionWriteInformationValue === "object" &&
          transactionWriteInformationValue !== null
        ) {
          transactionWriteInformationValueSchema = {};
          for (const key in transactionWriteInformationValue) {
            transactionWriteInformationValueSchema[key] = String(key);
          }
        }

        tableMappings = {
          name: docType,
          use_case: useCaseName,
          mappings: transactionWriteInformationValueSchema,
        };

        console.log("tableMappings", tableMappings);
        if (useCaseChainCodeConfigJson == null) {
          useCaseChainCodeConfigJson = {};
          useCaseChainCodeConfigJson[chainCodeName] = {};
          useCaseChainCodeConfigJson[chainCodeName][docType] = tableMappings;
        } else {
          useCaseChainCodeConfigJson[chainCodeName] = {};
          useCaseChainCodeConfigJson[chainCodeName][docType] = tableMappings;
        }

        fs.writeFileSync(
          USECASE_CHAINCODE_CONFIG_FILE,
          JSON.stringify(useCaseChainCodeConfigJson, null, 2)
        );
        const createTableInUseCaseResponse = await createNewTableInUseCaseInSmart(
          useCaseName,
          docType,
          JSON.stringify(tableMappings)
        );
        transactionWriteInformationValue = {
          ...smarTApiSpecificData,
          //...transactionIdInfo,
          ...transactionWriteInformationValue,
        };
        const sendTransactionDataToSmartResponse = await sendTransactionDataToSmart(
          transactionWriteInformationValue
        );
        console.log(
          createUseCaseResponse,
          createTableInUseCaseResponse,
          sendTransactionDataToSmartResponse
        );
      }
    }
  }
}

async function fetchAndSendBlockchainNetworkTransactionsToSmartApi(
  networkName
) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  const channelList = await getChannels(networkName);
  if (channelList) {
    for (const channel of channelList) {
      const channelStatus = await getChannelStatus(
        networkName,
        channel.channel_genesis_hash
      );
      console.log(channelStatus);

      const lastPushedBlock = getLastPushedBlockNumber(
        networkName,
        channel.channelname
      );

      for (
        let blockNumber = lastPushedBlock;
        blockNumber < channelStatus.latestBlock;
        blockNumber++
      ) {
        const blockDetails = await getBlockDetailsbyBlockNumber(
          networkName,
          channel.channel_genesis_hash,
          blockNumber
        );
        const transactions = blockDetails.transactions;
        let sendDataToSmartResponseStatus = null;
        try {
          for (transaction of transactions) {
            const transactionId =
              transaction.payload.header.channel_header.tx_id;
            //console.log(transactionId);
            if (transactionId) {
              //console.log(transactionId);
              const transactionInfo = await getTransactionByTxIdHash(
                networkName,
                channel.channel_genesis_hash,
                transactionId
              );
              //console.log(transactionInfo);
              await parseTransactionInfoWritesAndSendToSmartApi(
                transactionId,
                transactionInfo
              );
            } else {
              console.log("no transactions");
            }
          }
          sendDataToSmartResponseStatus = "success";
        } catch (error) {
          sendDataToSmartResponseStatus = "failed";
          console.log(error);
        } finally {
          if (
            sendDataToSmartResponseStatus &&
            sendDataToSmartResponseStatus === "success"
          ) {
            writeLastPushedBlockNumberToFile(
              blockNumber + 1,
              networkName,
              channel.channelname
            );
          }
        }
      }
    }
  } else {
    console.log("No channels present");
  }
}

async function pushDataToSmart() {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  updateMapConfigJsonGlobalVariableWithLatestChangesFromFile();
  const networkList = await getNetworkList();
  if (networkList) {
    for (network of networkList) {
      await fetchAndSendBlockchainNetworkTransactionsToSmartApi(network.name);
    }
  } else {
    console.log("No network is present");
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  while (true) {
    /* code to wait on goes here (sync or async) */
    try {
      await pushDataToSmart();
    } catch (e) {
      console.log("Error in pushDataToSmart: ", e);
    } finally {
      await delay(5000);
    }
  }
}

main();

// let transactionData = {
//   ApplicationType: "mother",
//   docType: "mother",
//   id: "+4755555555",
//   firstName: "Anandhakumar",
//   lastName: "Palanisamy",
//   email: "anandhakumarpalanisamy91@gmail.com",
//   phoneNumber: "+4755555555",
//   nin: "09069116879",
//   TransactionMessage: "Created a Mother Record for +4755555555",
//   TransactionUnixTimestamp: "1637693537",
//   TransactionIsoTimestamp: "2021-11-23T18:52:17.131Z",
//   AssetId: "+4755555555",
// };

// let table = {
//   mappings: {
//     AssetId: "AssetId",
//     TransactionIsoTimestamp: "TransactionIsoTimestamp",
//     TransactionMessage: "TransactionMessage",
//     TransactionUnixTimestamp: "TransactionUnixTimestamp",
//     UniqueID: "AssetId",
//     email: "email",
//     firstName: "firstName",
//     id: "id",
//     lastName: "lastName",
//     nin: "nin",
//     phoneNumber: "phoneNumber",
//   },
//   name: "mother",
//   use_case: "mother",
// };

// sendTransactionDataToSmart(transactionData).then(function (response) {
//   console.log("send transaction request response :", response);
//   getPushedTransactionListFromSmartApi("mother").then(function (response) {
//     console.log("getPushedTransactionResponse", response);
//   });
// });

// createNewTableInUseCaseInSmart("mother", "mother3", "mother").then(function (
//   response
// ) {
//   console.log("createNewTableInUseCaseInSmart response :", response);
// });

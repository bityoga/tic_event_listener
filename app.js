const axios = require("axios");
const https = require("https");

const HYPERLEDGER_EXPLORER_ACCESS_URL = "http://161.35.153.83:8090";
const ARTICONF_SMART_API_AUTHENTICATION_ACCESS_ACCESS_URL =
  "https://articonf1.itec.aau.at:30401";
const ARTICONF_SMART_API_USECASE_ACCESS_URL =
  "https://articonf1.itec.aau.at:30420";
const ARTICONF_SMART_API_BLOCKCHAIN_TRACE_RETRIEVAL_ACCESS_URL =
  "https://articonf1.itec.aau.at:30001";

async function getHlfExplorerAuthenticationToken(networkName) {
  let hlfExplorerAuthorisationToken = null;
  try {
    const authenticationCredentials = {
      user: "admin",
      password: "adminpw",
      network: networkName,
    };

    const axiosRequest = {
      method: "post",
      url: HYPERLEDGER_EXPLORER_ACCESS_URL + "/auth/login",
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
  //console.log("inside getSmartApiAuthenticationToken");
  let smartApiAuthorizationToken = null;
  try {
    const smartApiAuthenticationCredentials = {
      username: "regular@itec.aau.at",
      password: "2bViezK0Tst2LzsTIXix",
    };

    const axiosRequest = {
      method: "post",
      url: ARTICONF_SMART_API_AUTHENTICATION_ACCESS_ACCESS_URL + "/api/tokens",
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
  // console.log("inside sendTransactionData", transactionData);
  let sendTransactionDataToSmartResponse = null;
  try {
    const authenticationToken = await getSmartApiAuthenticationToken();

    //console.log(authenticationToken);

    if (authenticationToken) {
      const axiosRequest = {
        method: "POST",
        baseURL: ARTICONF_SMART_API_AUTHENTICATION_ACCESS_ACCESS_URL,
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
      const response = await axios(axiosRequest);
      console.log("send Transaction Data response");
      console.log(response.data);
      sendTransactionDataToSmartResponse = response.data;
    } else {
      console.log("smart api authentication token retrieval failed");
    }
  } catch (error) {
    console.error("sendTransactionDataToSmart() Error : ".error);
  } finally {
    return sendTransactionDataToSmartResponse;
  }
}

async function getPushedTransactionListFromSmartApi(useCaseName) {
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
          ARTICONF_SMART_API_BLOCKCHAIN_TRACE_RETRIEVAL_ACCESS_URL +
          "/api/use_cases/" +
          useCaseName +
          "/transactions",
        headers: {
          Authorization: "Bearer " + smartAuthenticationToken,
        },
      };
      //console.log(axiosRequest);
      const response = await axios(axiosRequest);
      console.log(response.data);
      transactionList = response.data;
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

async function getUseCaseListFromSmartApi() {
  let useCaseList = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken();
    if (smartAuthenticationToken) {
      var axiosRequest = {
        method: "get",
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        url: ARTICONF_SMART_API_USECASE_ACCESS_URL + "/api/use-cases",
        headers: {
          Authorization: "Bearer " + smartAuthenticationToken,
        },
      };
      const response = await axios(axiosRequest);
      //console.log(response.data);
      useCaseList = response.data;
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("getUseCaseListFromSmartApi() Error : ".error);
  } finally {
    console.log(useCaseList);
    return useCaseList;
  }
}

async function createNewUseCaseInSmart(useCaseName) {
  let createNewUseCaseInSmartApiResponse = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken();
    if (smartAuthenticationToken) {
      var data = JSON.stringify({ name: useCaseName });

      var config = {
        method: "post",
        url:
          "https://articonf1.itec.aau.at:30420/api/use-cases?name=" +
          useCaseName,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + window.btoa(smartAuthenticationToken),
        },
        data: data,
      };
      console.log(config);
      // try {
      //   createNewUseCaseInSmartApiResponse = await axios(config);
      //   console.log(createNewUseCaseInSmartApiResponse);
      //   createNewUseCaseInSmartApiResponse =
      //     createNewUseCaseInSmartApiResponse.data;
      // } catch (error) {
      //   console.log(error);
      // } finally {
      //   console.log(createNewUseCaseInSmartApiResponse);
      // }
      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });

      //console.log(response);
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("createNewUseCaseInSmart() Error : ".error);
  } finally {
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
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken(
      networkName
    );

    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        url:
          HYPERLEDGER_EXPLORER_ACCESS_URL +
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
          HYPERLEDGER_EXPLORER_ACCESS_URL +
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
  let networkList = null;
  try {
    const axiosRequest = {
      method: "get",
      url: HYPERLEDGER_EXPLORER_ACCESS_URL + "/auth/networklist",
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
  let channelList = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken(
      networkName
    );
    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        url: HYPERLEDGER_EXPLORER_ACCESS_URL + "/api/channels/info",
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
          HYPERLEDGER_EXPLORER_ACCESS_URL + "/api/status/" + channelGenesisHash,
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

async function parseTransactionInfoWritesAndSendToSmartApi(
  transactionId,
  transactionInfo
) {
  for (writes of transactionInfo.write_set) {
    if (writes["chaincode"] !== "lscc") {
      const writeSet = writes["set"];
      const chainCodeName = writes["chaincode"];
      //console.log(writeSet);
      for (write of writeSet) {
        //console.log(write);
        if (write.value.length > 0) {
          write.value = JSON.parse(write.value);
        }
        let useCaseName = chainCodeName;
        let smarTApiSpecificData = {
          ApplicationType: useCaseName,
        };
        let transactionIdInfo = {
          transactionId: transactionId,
          chainCodeName: chainCodeName,
        };
        let transactionInformation = {
          ...smarTApiSpecificData,
          ...transactionIdInfo,
          ...write,
        };
        console.log(transactionInformation);
        // const sendTransactionDataToSmartResponse = await sendTransactionDataToSmart(
        //   transactionInformation
        // );
        // console.log(sendTransactionDataToSmartResponse);

        /*let transactionWriteInformationValue = write.value;
        console.log(transactionWriteInformationValue.length);
        if (transactionWriteInformationValue.length > 0) {
          transactionWriteInformationValue = JSON.parse(
            transactionWriteInformationValue
          );
        } else {
          // empty string - so no need for JSON.parse;
        }

        let useCaseName = chainCodeName;
        let smarTApiSpecificData = {
          ApplicationType: useCaseName,
        };
        let transactionIdInfo = {
          transactionId: transactionId,
          chainCodeName: chainCodeName,
        };
        transactionWriteInformationValue = {
          ...smarTApiSpecificData,
          ...transactionIdInfo,
          ...transactionWriteInformationValue,
        };
        console.log(transactionWriteInformationValue);
        const sendTransactionDataToSmartResponse = await sendTransactionDataToSmart(
          transactionWriteInformationValue
        );
        console.log(sendTransactionDataToSmartResponse);*/
      }
    }
  }
}

async function fetchAndSendBlockchainNetworkTransactionsToSmartApi(
  networkName
) {
  const channelList = await getChannels(networkName);
  if (channelList) {
    for (const channel of channelList) {
      const channelStatus = await getChannelStatus(
        networkName,
        channel.channel_genesis_hash
      );
      console.log(channelStatus);

      for (
        let blockNumber = 0;
        blockNumber < channelStatus.latestBlock;
        blockNumber++
      ) {
        const blockDetails = await getBlockDetailsbyBlockNumber(
          networkName,
          channel.channel_genesis_hash,
          blockNumber
        );
        const transactions = blockDetails.transactions;

        for (transaction of transactions) {
          const transactionId = transaction.payload.header.channel_header.tx_id;
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
      }
    }
  } else {
    console.log("No channels present");
  }
}

async function pushDataToSmart() {
  const networkList = await getNetworkList();
  if (networkList) {
    for (network of networkList) {
      await fetchAndSendBlockchainNetworkTransactionsToSmartApi(network.name);
    }
  } else {
    console.log("No network is present");
  }
}

createNewUseCaseInSmart("ohrid");
//getUseCaseListFromSmartApi();
//getPushedTransactionListFromSmartApi("car-sharing-official");

// pushDataToSmart();

// var data = JSON.stringify({ name: "anand" });

// var config = {
//   method: "post",
//   url: "https://articonf1.itec.aau.at:30420/api/use-cases?name=anand",
//   httpsAgent: new https.Agent({
//     rejectUnauthorized: false,
//   }),
//   headers: {
//     "Content-Type": "application/json",
//     Authorization:
//       "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJAaXRlYy5hYXUuYXQiLCJjcmVhdGVkX2F0IjoiMjAyMS0xMi0xNSAyMToyODo1Ny45MjE3ODgiLCJ2YWxpZF91bnRpbCI6IjIwMjEtMTItMTYgMjE6Mjg6NTcuOTIxNzg4In0.gp13LARYOduRFHSNk9dKl_9Vtehkg2CXQu_Wiez4ptc",
//   },
//   data: data,
// };

// console.log(config);
// axios(config)
//   .then(function (response) {
//     console.log(JSON.stringify(response.data));
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

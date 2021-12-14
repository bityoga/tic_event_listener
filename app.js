const axios = require("axios");
const https = require("https");

const HYPERLEDGER_EXPLORER_ACCESS_URL = "http://161.35.153.83:8090";
const ARTICONF_SMART_API_ACCESS_URL = "https://articonf1.itec.aau.at:30401";

async function getHlfExplorerAuthenticationToken() {
  let hlfExplorerAuthorisationToken = null;
  try {
    const authenticationCredentials = {
      user: "admin",
      password: "adminpw",
      network: "hlfnet",
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
  let smartApiAuthorizationToken = null;
  try {
    const authenticationCredentials = {
      username: "regular@itec.aau.at",
      password: "2bViezK0Tst2LzsTIXix",
    };

    const axiosRequest = {
      method: "post",
      url: ARTICONF_SMART_API_ACCESS_URL + "/api/tokens",
      // To bypass  "Error: self signed certificate in certificate chain"
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      headers: {
        /*"Content-Type": "text/plain",*/
      },

      data: authenticationCredentials,
    };

    const response = await axios(axiosRequest);
    //console.log(response);
    console.log(response.data);

    smartApiAuthorizationToken = response["data"]["token"];
  } catch (error) {
    console.error("getHlfExplorerAuthenticationToken() Error :", error);
  } finally {
    return smartApiAuthorizationToken;
  }
}

async function sendTransactionDataToSmart(transactionData) {
  console.log("inside sendTransactionData");
  let sendTransactionDataToSmartResponse = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken();

    console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "post",
        url: ARTICONF_SMART_API_ACCESS_URL + "/api/trace",
        headers: {
          Authorization: "Bearer " + authenticationToken,
        },
        data: transactionData,
      };

      const response = await axios(axiosRequest);
      console.log("send Transaction Data response");
      console.log(response);
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

async function getNetworkList() {
  let networkList = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken();
    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        url: ARTICONF_SMART_API_ACCESS_URL + "/auth/networklist",
        headers: {
          Authorization: "Bearer " + authenticationToken,
        },
      };

      const response = await axios(axiosRequest);
      //console.log(response.data);
      networkList = response.data.networkList;
    } else {
      console.log("authentication token retrieval failed");
    }
  } catch (error) {
    console.error("getNetworkList() Error : ".error);
  } finally {
    return networkList;
  }
}

/* getNetworkList()
  .then(function (response) {
    console.log(response);
  }); */

async function getChannels() {
  let channelList = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken();
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

/* getChannels()
  .then(function (response) {
    //console.log(response);
    response.forEach(function (item, index) {
      //getChainCodeList(item.channel_genesis_hash)
      getBlockActivityList(item.channel_genesis_hash)
    });
  }); */

async function getChainCodeList(channelGenesisHash) {
  let chainCodeList = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken();

    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        url:
          HYPERLEDGER_EXPLORER_ACCESS_URL +
          "/api/chaincode/" +
          channelGenesisHash,
        headers: {
          Authorization: "Bearer " + authenticationToken,
        },
      };

      const response = await axios(axiosRequest);
      //console.log(response.data);
      chainCodeList = response.data.chaincode;
    } else {
      console.log("authentication token retrieval failed");
    }
  } catch (error) {
    console.error("getNetworkList() Error : ".error);
  } finally {
    return chainCodeList;
  }
}

async function getBlockActivityList(channelGenesisHash) {
  let blockActivityist = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken();

    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        url:
          HYPERLEDGER_EXPLORER_ACCESS_URL +
          "/api/blockActivity/" +
          channelGenesisHash,
        headers: {
          Authorization: "Bearer " + authenticationToken,
        },
      };

      const response = await axios(axiosRequest);
      //console.log(response.data);
      blockActivityist = response.data.row;
    } else {
      console.log("authentication token retrieval failed");
    }
  } catch (error) {
    console.error("getBlockActivityList() Error : ".error);
  } finally {
    return blockActivityist;
  }
}

async function getTransactionByTxIdHash(channelGenesisHash, txIdHash) {
  let transactionInfo = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken();

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
    console.error("getBlockActivityList() Error : ".error);
  } finally {
    return transactionInfo;
  }
}

async function getTransactionList(channelGenesisHash, number, txIdHash) {
  let transactionInfo = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken();

    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        url:
          HYPERLEDGER_EXPLORER_ACCESS_URL +
          "/api/txList/" +
          channelGenesisHash +
          "/" +
          number +
          "/" +
          txIdHash,
        headers: {
          Authorization: "Bearer " + authenticationToken,
        },
      };

      const response = await axios(axiosRequest);
      console.log(response.data);
      /* transactionInfo = response.data.row;
      console.log(transactionInfo.txhash);
      console.log(transactionInfo.chaincodename);
      console.log(transactionInfo.createdt);
      console.log(transactionInfo.write_set); */
    } else {
      console.log("authentication token retrieval failed");
    }
  } catch (error) {
    console.error("getBlockActivityList() Error : ".error);
  } finally {
    return transactionInfo;
  }
}

async function getBlocksAndTransactionList(channelGenesisHash, number) {
  let blocksAndTransactionInfo = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken();

    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: "get",
        url:
          HYPERLEDGER_EXPLORER_ACCESS_URL +
          "/api/blockAndTxList/" +
          channelGenesisHash +
          "/" +
          number,
        headers: {
          Authorization: "Bearer " + authenticationToken,
        },
      };

      const response = await axios(axiosRequest);
      //console.log(response.data);
      blocksAndTransactionInfo = response.data.rows;
      /* for (block of blocksAndTransactionInfo) {
        console.log(block.blockhash);
        console.log(block.createdt);
        console.log(block.blksize);
        console.log(block.txhash);
      } */
    } else {
      console.log("authentication token retrieval failed");
    }
  } catch (error) {
    console.error("getBlocksAndTransactionList() Error : ".error);
  } finally {
    return blocksAndTransactionInfo;
  }
}

async function fetchData() {
  const channelList = await getChannels();
  if (channelList) {
    for (const channel of channelList) {
      //const chaincodeList = await getChainCodeList(channel.channel_genesis_hash);
      const blockActivityList = await getBlockActivityList(
        channel.channel_genesis_hash
      );
      for (const block of blockActivityList) {
        //console.log(block.txhash);
        const listofBlockTransactionIdHashes = block.txhash;
        for (transactionIdHash of listofBlockTransactionIdHashes) {
          const transactionInfo = await getTransactionByTxIdHash(
            channel.channel_genesis_hash,
            transactionIdHash
          );
          console.log(transactionInfo);
          // console.log(transactionInfo.txhash);
          // console.log(transactionInfo.chaincodename);
          // console.log(transactionInfo.createdt);
          // //console.log(transactionInfo.write_set);
          for (writes of transactionInfo.write_set) {
            //console.log(writes)
            if (writes["chaincode"] !== "lscc") {
              //console.log(writes["chaincode"], writes["set"]);
              console.log(writes["set"]);
            }
          }

          //const smartApiAuthenticationToken = await getSmartApiAuthenticationToken();
          //console.log(smartApiAuthenticationToken);
          const sendTransactionDataToSmartResponse = await sendTransactionDataToSmart(
            transactionInfo
          );
          console.log(sendTransactionDataToSmartResponse);
          //await getTransactionList(channel.channel_genesis_hash, 65960697, transactionIdHash)
        }
      }
    }
  } else {
    console.log("No channels present");
  }
}

async function fetchDataCombined() {
  const channelList = await getChannels();

  if (channelList) {
    for (const channel of channelList) {
      //const chaincodeList = await getChainCodeList(channel.channel_genesis_hash);
      const blockAndTransactionList = await getBlocksAndTransactionList(
        channel.channel_genesis_hash,
        25
      );
      for (const block of blockAndTransactionList) {
        //console.log(block.txhash);
        const listofBlockTransactionIdHashes = block.txhash;
        for (transactionIdHash of listofBlockTransactionIdHashes) {
          const transactionInfo = await getTransactionByTxIdHash(
            channel.channel_genesis_hash,
            transactionIdHash
          );
          console.log(transactionInfo.txhash);
          console.log(transactionInfo.chaincodename);
          console.log(transactionInfo.createdt);
          //console.log(transactionInfo.write_set);
          for (writes of transactionInfo.write_set) {
            //console.log(writes)
            if (writes["chaincode"] !== "lscc") {
              console.log(writes["chaincode"], writes["set"]);
            }
          }
          const smartApiAuthenticationToken = await getSmartApiAuthenticationToken();
          console.log(smartApiAuthenticationToken);
          //await getTransactionList(channel.channel_genesis_hash, 65960697, transactionIdHash)
        }
      }
    }
  } else {
    console.log("No channels present");
  }
}

fetchData();
//fetchDataCombined();

/* getHlfExplorerAuthenticationToken().then(function (token) {
  const channelGenesisHash = "48f7c78d29ec2a9b04731702708fafbeaeec512c278ba7d479226dd9b9094464";
  var config = {
    method: 'get',
    url: HYPERLEDGER_EXPLORER_ACCESS_URL + '/api/blockAndTxList/' + channelGenesisHash + '/65960697',
    headers: {
      'Authorization': 'Bearer ' + token,
    }
  };

  axios(config)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });

}); */

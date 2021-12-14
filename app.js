const axios = require('axios');


const HYPERLEDGER_EXPLORER_ACCESS_URL = "http://161.35.153.83:8090";

async function getHlfExplorerAuthenticationToken() {
  let hlfExplorerAuthorisationToken = null;
  try {
    const authenticationCredentials = {
      "user": "admin",
      "password": "adminpw",
      "network": "hlfnet"
    };

    const axiosRequest = {
      method: 'post',
      url: HYPERLEDGER_EXPLORER_ACCESS_URL + '/auth/login',
      headers: {},
      data: authenticationCredentials
    };

    const response = await axios(axiosRequest);
    //console.log(response.data);
    if (response["data"]["success"] === true) {
      hlfExplorerAuthorisationToken = response["data"]["token"]
    }

  } catch (error) {
    console.error("getHlfExplorerAuthenticationToken() Error :", error);
  }
  finally {
    return hlfExplorerAuthorisationToken;
  }
}




async function getNetworkList() {
  let networkList = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken();
    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: 'get',
        url: HYPERLEDGER_EXPLORER_ACCESS_URL + '/auth/networklist',
        headers: {
          'Authorization': 'Bearer ' + authenticationToken,
        }
      };

      const response = await axios(axiosRequest);
      //console.log(response.data);
      networkList = response.data.networkList;
    } else {
      console.log("authentication token retrieval failed");
    }

  } catch (error) {
    console.error("getNetworkList() Error : ".error);
  }
  finally {
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
        method: 'get',
        url: HYPERLEDGER_EXPLORER_ACCESS_URL + '/api/channels/info',
        headers: {
          'Authorization': 'Bearer ' + authenticationToken,
        }
      };

      const response = await axios(axiosRequest);
      //console.log(response.data);
      channelList = response.data.channels;
    } else {
      console.log("authentication token retrieval failed");
    }

  } catch (error) {
    console.error("getChannels() Error : ".error);
  }
  finally {
    return channelList;
  }
}

getChannels()
  .then(function (response) {
    //console.log(response);
    response.forEach(function (item, index) {
      //getChainCodeList(item.channel_genesis_hash)
      getBlockActivityList(item.channel_genesis_hash)
    });
  });



async function getChainCodeList(channelGenesisHash) {
  let chainCodeList = null;
  try {
    const authenticationToken = await getHlfExplorerAuthenticationToken();

    //console.log(authenticationToken);
    if (authenticationToken) {
      const axiosRequest = {
        method: 'get',
        url: HYPERLEDGER_EXPLORER_ACCESS_URL + '/api/chaincode/' + channelGenesisHash,
        headers: {
          'Authorization': 'Bearer ' + authenticationToken,
        }
      };

      const response = await axios(axiosRequest);
      console.log(response.data);
      chainCodeList = response.data.chaincode;
    } else {
      console.log("authentication token retrieval failed");
    }

  } catch (error) {
    console.error("getNetworkList() Error : ".error);
  }
  finally {
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
        method: 'get',
        url: HYPERLEDGER_EXPLORER_ACCESS_URL + '/api/blockActivity/' + channelGenesisHash,
        headers: {
          'Authorization': 'Bearer ' + authenticationToken,
        }
      };

      const response = await axios(axiosRequest);
      console.log(response.data);
      blockActivityist = response.data.row;
    } else {
      console.log("authentication token retrieval failed");
    }

  } catch (error) {
    console.error("getBlockActivityList() Error : ".error);
  }
  finally {
    return blockActivityist;
  }
}
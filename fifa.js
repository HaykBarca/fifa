(function (sId, maskedDefId, maxb, repeatTime = 2000) {
  // required for transfer requests
  let SID = sId;
  let intervalRef = null;

  const createInterval = () => {
    intervalRef = setInterval(async () => {

      const request = async () => {
        try {
          const response = await fetch(
            `https://utas.external.s2.fut.ea.com/ut/game/fifa21/transfermarket?num=21&start=0&type=player&maskedDefId=${maskedDefId}&rare=SP&maxb=${maxb}`,
            {
              method: 'GET',
              headers: {
                'X-UT-SID': SID,
              },
            }
          );
  
          const json = await response.json();
          return json;
        } catch(error) {
          setTimeout(() => {
            getCode();
          }, 5000);
          clearInterval(intervalRef);
          intervalRef = null;
          return;
        }
      };
    
      const answer = await request();
    
      if (!answer.auctionInfo.length) {
        return;
      }
    
      answer.auctionInfo.map(async (auction) => {
        const buyNowPrice = auction.buyNowPrice;
        const tradeId = auction.tradeId;
    
        const bidUrl = `https://utas.external.s2.fut.ea.com/ut/game/fifa21/trade/${tradeId}/bid`;
        const reqBody = {
          bid: buyNowPrice,
        };
    
        const response = await fetch(
          bidUrl,
          {
            method: 'PUT',
            body: JSON.stringify(reqBody),
            headers: {
              'X-UT-SID': SID,
            },
          }
        );
        const json = await response.json();
        
        alert(`Item won: ${JSON.stringify(json)}`);
      });
  
  
    }, repeatTime);
  }

  // Auth
  // get SID
  const getSID = async (access_token) => {
    const url = 'https://utas.external.s2.fut.ea.com/ut/auth';
    const body = {
      clientVersion: 1,
      ds: "b5b2ac89d27122ac3bc737c6305cf1539b74178b098a052cded831005aa9815b/210",
      gameSku: "FFA21PCC",
      identification: {
        authCode: access_token,
        redirectUrl: "nucleus:rest"
      },
      isReadOnly: false,
      locale: "en-US",
      method: "authcode",
      nucleusPersonaId: 302899109,
      priorityLevel: 4,
      sku: "FUT21WEB",
    };

    const response = await fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'X-UT-PHISHING-TOKEN': 0,
        },
      }
    );
    const json = await response.json();

    SID = json.sid;
    createInterval();
  }


  
  // get accessToken
  async function getCode () {
    const access_token = localStorage.getItem("_eadp.identity.access_token");
    const url = `https://accounts.ea.com/connect/auth?client_id=FOS-SERVER&redirect_uri=nucleus:rest&response_type=code&access_token=${access_token}&release_type=prod&client_sequence=ut-auth`
    const request = async () => {
      const response = await fetch(
        url,
        {
          method: 'GET',
        }
      );
      const json = await response.json();
      return json;
    };
  
    const answer = await request();
    getSID(answer.code);
  }

  createInterval();
})('e1a6d835-7efb-47f9-861c-b66ccf20476a', 221174, 19000, 1000);

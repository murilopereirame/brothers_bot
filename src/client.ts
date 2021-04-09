import { create, Whatsapp } from 'venom-bot';
import BanHandler from './ban';
import CorreHandler from './corre';

export default class Client {
  private static instance: Client;
  private static whatsAppClient;
  private static qrCode;

  public static getInstance = async () => {
    if(!Client.instance) {
      Client.instance = new Client();
      let client = await create(
        'IDV', 
        (base64Qrimg, asciiQR, attempts, urlCode) => {
          Client.qrCode = base64Qrimg;
          console.log('Number of attempts to read the qrcode: ', attempts);
          console.log('Terminal qrcode: ', asciiQR);
          console.log('base64 image string qrcode: ', base64Qrimg);
          console.log('urlCode (data-ref): ', urlCode);
        }
      );
      Client.whatsAppClient = client; 
      Client.listen();
    }

    return Client.instance;
  }

  public getClient = () => {
    return Client.whatsAppClient;
  }

  public getQrCode = () => {
    return Client.qrCode
  }

  private static listen = () => {
    Client.whatsAppClient.onMessage((message) => {
      //'554396886767-1506385092@g.us' IDV
      if(message.isGroupMsg === true && message.chat.id === '554396886767-1506385092@g.us') {
        let messagePieces = message.body.toString().split(' ');
        switch(messagePieces[0]) {
          case '/ban':
            if(message.mentionedJidList.length === 0)
		          return Client.whatsAppClient.sendText(message.from, "Faltou mencionar o arrombado!");
            else
              BanHandler.getInstance().startVote(message.author, message.mentionedJidList[0], Number.parseInt(messagePieces[2]), message.from);
            break;
          case '/vote':
            if(message.mentionedJidList.length === 0)
		          return Client.whatsAppClient.sendText(message.from, "Faltou mencionar o arrombado!");
            else
              BanHandler.getInstance().vote(message.mentionedJidList[0], message.author, message.chat.id);
            break;
          case "/stopVote":
            if(message.mentionedJidList.length === 0)
		          return Client.whatsAppClient.sendText(message.from, "Faltou mencionar o arrombado!");
            else
              BanHandler.getInstance().stopVote(message.mentionedJidList[0], message.author, message.chat.id);
            break;
          case "/iniciarCorre":
            if(!messagePieces[1])
              return Client.whatsAppClient.sendText(message.from, "Faltou o preço!");
            else
              CorreHandler.getInstance().startCorre(message.author, Number.parseFloat(messagePieces[1]), message.from, messagePieces[2] ? Number.parseFloat(messagePieces[2]) : undefined);
            break;
          case "/entrar":
            if(!messagePieces[1])
              return Client.whatsAppClient.sendText(message.from, "Faltou a quantidade!");
            else
              CorreHandler.getInstance().entrar(message.author, Number.parseFloat(messagePieces[1]), message.from);
            break;
          case "/sair":
            CorreHandler.getInstance().sair(message.author, message.from);
            break;
          case "/info":
            CorreHandler.getInstance().info(message.from);
            break;
          case "/finalizarCorre":
            CorreHandler.getInstance().finalizaCorre(message.from);
            break;    
          case "/comandos":
            return Client.whatsAppClient.sendText(message.from, 
            `*/ban* - Inicia voteban na pessoa citada\n`+
            `*Ex:* /ban @Purilo 5\n\n`+
            `*/vote* - Vota no ban da pessoa citada\n`+
            `*Ex:* /vote @Purilo\n\n`+
            `*/stopVote* - Cancela a votação da pessoa citada\n`+
            `*Ex:* /stopVote @Purilo\n\n`+
            `*/iniciarCorre* - Inicia um corre\n`+
            `*Ex:* /iniciarCorre 1.4 0\n\n`+
            `*/entrar* - Entra no corre\n`+
            `*Ex:* /entrar 15\n\n`+
            `*/sair* - Você vira um ramelão\n\n`+
            `*/info* - Informa a situação do corre\n\n`+
            `*/finalizarCorre* - Finaliza o corre e devolve um resumo`);
            break;
          case "/ping":
            return Client.whatsAppClient.reply(message.from, "Pong!", message.id);
            break;
        }
      }
    });
  }
}
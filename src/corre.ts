import Client from "./client";

interface Noia {
  amount: number;
  name: string;
}

interface Corre {
  price: number;
  reserved: Noia[];
  minAmount?: number;
  total: number;
}

export default class CorreHandler {
  private static instance: CorreHandler;
  private corres: Corre = undefined;

  public static getInstance = () => {
    if (!CorreHandler.instance) CorreHandler.instance = new CorreHandler();

    return CorreHandler.instance;
  };

  public startCorre = async (
    startedBy: string,
    price: number,
    group: string,
    minAmount?: number
  ) => {
    let client = (await Client.getInstance()).getClient();
    let cleanSource = startedBy.replace("@c.us", "");
    let minimo = 0;

    if (this.corres) {
      client.sendText(group, "Já tem um corre em andamento!");
    }

    if (minAmount) minimo = minAmount;

    let corre: Corre = {
      price,
      reserved: [],
      minAmount: minimo,
      total: 0,
    };

    this.corres = corre;

    client.sendMentioned(
      group,
      `*Corre iniciado! ${price.toFixed(
        2
      )} p/ 1g*\n*Inciado por:* @${cleanSource}\n*Qtde mínima:* ${minimo.toFixed(
        2
      )}\n`,
      [cleanSource]
    );
  };

  public entrar = async (source: string, qtde: number, group: string) => {
    let client = (await Client.getInstance()).getClient();
    let cleanSource = source.replace("@c.us", "");

    let noiaIndex = this.corres.reserved.findIndex((elem) => {
      return elem.name === source;
    });

    if (noiaIndex >= 0) {
      return client.sendText(group, "Você já está no corre!");
    }

    this.corres.reserved.push({
      name: source,
      amount: qtde,
    });

    this.corres.total += qtde;

    client.sendMentioned(
      group,
      `*@${cleanSource} virou um noia!*\n*Qtde reservada:* ${qtde.toFixed(
        2
      )}g\n`,
      [cleanSource]
    );
  };

  public sair = async (source: string, group: string) => {
    let client = (await Client.getInstance()).getClient();
    let cleanSource = source.replace("@c.us", "");

    if (!this.corres) {
      return client.sendText(group, "Não há corre ativo!");
    }

    let noiaIndex = this.corres.reserved.findIndex((elem) => {
      return elem.name === source;
    });

    if (noiaIndex === -1) {
      return client.sendText(group, "Você não está no corre!");
    }

    this.corres.total -= this.corres.reserved[noiaIndex].amount;
    this.corres.reserved.splice(noiaIndex, 1);

    client.sendMentioned(
      group,
      `*@${cleanSource} ramelou!*\n*Qtde no corre:* ${this.corres.total}\n`,
      [cleanSource]
    );
  };

  public info = async (group: string) => {
    let client = (await Client.getInstance()).getClient();
    let noias = [];

    if (!this.corres) {
      return client.sendText(group, "Não há corre ativo!");
    }

    let correPrice = this.corres.price.toFixed(2);
    let correMin = this.corres.minAmount.toFixed(2);
    let noiasFormatado = '';

    this.corres.reserved.map((item, index) => {
      let clearNoia = item.name.replace("@c.us", "");
      noias.push(clearNoia);
      noiasFormatado += `- @${clearNoia} ${item.amount.toFixed(2)}g\n`;
    });

    client.sendMentioned(
      group,
      `*_Resumo do corre:_*\nPreço (g): R$${correPrice}\n`+
      `Qtde. Mínima: ${correMin}\n`+
      `*Noias*: ${noiasFormatado}\n`+
      `*Total*: ${this.corres.total.toFixed(2)}g`,
      noias
    );
  };

  public finalizaCorre = async (group: string) => {
    let client = (await Client.getInstance()).getClient();
    let noias = [];

    if (!this.corres) {
      return client.sendText(group, "Não há corre ativo!");
    }

    let correPrice = this.corres.price.toFixed(2);
    let correMin = this.corres.minAmount.toFixed(2);
    let noiasFormatado = '';

    this.corres.reserved.map((item, index) => {
      let clearNoia = item.name.replace("@c.us", "");
      noias.push(clearNoia);
      noiasFormatado += `- @${clearNoia} ${item.amount.toFixed(2)}g\n`;
    });

    client.sendMentioned(
      group,
      `*_Resumo do corre:_*\nPreço (g): R$${correPrice}\n`+
      `Qtde. Mínima: ${correMin}\n`+
      `*Noias*: ${noiasFormatado}\n`+
      `*Total*: ${this.corres.total.toFixed(2)}g`,
      noias
    );

    this.corres = undefined;
  };
}

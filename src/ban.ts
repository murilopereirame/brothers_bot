import Client from "./client";

interface VoteBan {
  startedBy: string;
  target: string;
  totalVotes: number;
  minVotes: number;
  votes: string[];
}

export default class BanHandler {
  private static instance: BanHandler;
  private voteBans: VoteBan[] = [];

  public static getInstance = () => {
    if (!BanHandler.instance) BanHandler.instance = new BanHandler();

    return BanHandler.instance;
  };

  public startVote = async (
    startedBy: string,
    target: string,
    minVotes: number,
    group: string
  ) => {
    let client = (await Client.getInstance()).getClient();
    let cleanTarget = target.replace("@c.us", "");
    let cleanSource = startedBy.replace("@c.us", "");

    if (
      this.voteBans.find((elem) => {
        return elem.target === target;
      })
    )
      return client.sendMentioned(
        group,
        `*@${cleanTarget} já possui um voteban ativo!*`,
        [cleanTarget]
      );

    let vote: VoteBan = {
      startedBy,
      target,
      totalVotes: 1,
      minVotes,
      votes: [startedBy],
    };

    this.voteBans.push(vote);
    client.sendMentioned(
      group,
      `*Voteban em @${cleanTarget}*\n*Inciado por:* @${cleanSource}\n*Votos mínimos:* ${minVotes}\n*Total de Votos:* 1`,
      [cleanTarget, cleanSource]
    );
  };

  public vote = async (target: string, source: string, group: string) => {
    let cleanTarget = target.replace("@c.us", "");
    let cleanSource = source.replace("@c.us", "");

    let client = (await Client.getInstance()).getClient();

    if (
      this.voteBans.find((elem) => {
        return elem.votes.includes(source);
      })
    )
      return client.sendMentioned(group, `*@${cleanSource} você já votou!*`, [
        cleanSource,
      ]);

    let targetVoteIndex = this.voteBans.findIndex((elem) => {
      return elem.target === target;
    });

    if(targetVoteIndex === -1) {
      return client.sendText(group, "Não há voteban ativo nesse corno!");
    }

    let clearStarter = this.voteBans[targetVoteIndex].startedBy.replace("@c.us", "");

    this.voteBans[targetVoteIndex].totalVotes++;
    this.voteBans[targetVoteIndex].votes.push(source);

    client.sendMentioned(
      group,
      `*Voteban em @${cleanTarget}*\n*Inciado por:* @${clearStarter}\n*Votos mínimos:* ${this.voteBans[targetVoteIndex].minVotes}\n*Total de Votos:* ${this.voteBans[targetVoteIndex].totalVotes}`,
      [cleanTarget, clearStarter]
    );

    if (
      this.voteBans[targetVoteIndex].totalVotes >=
      this.voteBans[targetVoteIndex].minVotes
    ) {
      this.ban(this.voteBans[targetVoteIndex].target, group);
    }
  };

  public stopVote = async (target: string, source: string, group: string) => {
    let client = (await Client.getInstance()).getClient();

    let cleanTarget = target.replace("@c.us", "");
    let cleanSource = source.replace("@c.us", "");

    if (
      !this.voteBans.find((elem) => {
        return elem.target === target;
      })
    )
      return client.sendMentioned(
        group,
        `*@${cleanTarget} não possui um voteban ativo!`,
        [cleanTarget]
      );

    let targetVoteIndex = this.voteBans.findIndex((elem) => {
      return elem.target === target;
    });
    this.voteBans.splice(targetVoteIndex, 1);

    client.sendMentioned(
      group,
      `*Voteban em @${cleanTarget}*\n*Cancelado por:* @${cleanSource}`,
      [cleanTarget, cleanSource]
    );
  };

  public ban = async (target: string, group: string) => {
    let client = (await Client.getInstance()).getClient();

    client.removeParticipant(group, target);

    let backDate = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);

    client.sendText(
      target,
      `Você foi removido do grupo \"Irmãos do Vale\" pelo período de 24 horas. Podendo retornar às ${backDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${backDate
        .getMinutes()
        .toString()
        .padStart(2, "0")} do dia ${backDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${(backDate.getMonth() + 1)
        .toString()
        .padStart(
          2,
          "0"
        )}. Caso julgar necessário poderemos revisar o seu banimento.`
    );
  };
}

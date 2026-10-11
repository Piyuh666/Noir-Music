/**
 * Base Command structure
 */
export class Command {
  constructor(data) {
    this.data = data.data;
    this.execute = data.execute;
    this.category = data.category || 'misc';
    this.cooldown = data.cooldown || 3;
    this.ownerOnly = data.ownerOnly || false;
    this.premiumOnly = data.premiumOnly || false;
    this.djOnly = data.djOnly || false;
    this.voiceOnly = data.voiceOnly || false;
    this.playerRequired = data.playerRequired || false;
  }
}

function HCF(a, b) {
  if (isNaN(a) || isNaN(b)) throw TypeError('HCF must only take integers');
  if (a === 0) return b;
  if (b === 0) return a;
  return HCF(b, a % b);
}

class Bot {
  constructor(tasks) {
    if (!tasks || tasks.length === 0) return;
    this.tasks = tasks.map(f => ({ ...require(`./tasks/${f}`), runAttempts: 0, running: false }));
    this.timeoutHCF = this.tasks.map(t => t.timeout).reduce((hcf, cur) => HCF(hcf, cur), this.tasks[0].timeout);
    this.tasks.forEach(t => t.timeout /= this.timeoutHCF);
    this.runCount = 0;
    this.run();
    this.interval = setInterval(this.run.bind(this), this.timeoutHCF);
  }

  async run() {
    await Promise.all(this.tasks.map(async ({ task, timeout, runAttempts, running }) => {
      if (++this.runCount % timeout === 0) {
        if (runAttempts >= 5) {
          runAttempts = 0;
          running = false;
          task.log(`Existing process warning bypassed - too many prevented runs...`);
        }
        else if (running) return task.log(`Run prevented due to existing process - Failed Attempts: ${++runAttempts}`);
        running = true;
        await task.run();
        running = false;
      }
    }));
  }
}

new Bot(['cicd', 'public-ip']);

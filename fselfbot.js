const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');

const client = new Client({
    checkUpdates: false,
});
let yourUserID;
const choices = ["rock", "paper", "scissors"];
let secretNumber;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


function getYourUserID() {
    rl.question("Enter your user ID (the bot will listen to this ID): ", (userID) => {
        yourUserID = userID;
        getToken();
    });
}


function getToken() {
    rl.question("Enter your Discord token: ", (token) => {
        client.login(token);

        client.on('ready', async () => {
            console.log("Bot is connected to Discord.");

            generateSecretNumber();
        });

        client.on('message', async (message) => {
            if (message.author.id !== yourUserID) {
                return;
            }

            const args = message.content.split(' ');
            const command = args[0];

            if (command === 'fmenu') {
                message.reply(`# FMENU:
> fmenu
> fclear <count>
> fpoll <question> <option1> <option2> <option3>
> fcoinflip
> frockpaperscissors
> fguessnumber`).then((response) => {
                    setTimeout(() => {
                        message.delete();
                        response.delete();
                    }, 5000);
                });
            } else if (command === 'fpoll') {
                if (args.length < 5) {
                    message.reply('Usage: fpoll <question> <option1> <option2> <option3>');
                    return;
                }

                const question = args[1];
                const options = args.slice(2);

                const pollMessage = `# ${question}\n\n${options.map((option, index) => `${index + 1}. ${option}`).join('\n')}`;

                const poll = await message.channel.send(pollMessage);

                for (let i = 0; i < options.length; i++) {
                    await poll.react(`${i + 1}️⃣`);
                }
            } else if (command === 'fclear') {
                const count = parseInt(args[1], 10);

                if (isNaN(count) || count < 1) {
                    message.reply('Invalid count. Please provide a valid number of messages to clear.');
                    return;
                }

                const messages = await message.channel.messages.fetch({ limit: count });
                const userMessages = messages.filter((msg) => msg.author.id === yourUserID);

                userMessages.forEach(async (msg) => {
                    await msg.delete();
                });

                message.reply(`Successfully cleared ${userMessages.size} messages.`);
            } else if (command === 'fcoinflip') {
                const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
                message.reply(`You got: ${result}`);
            } else if (command === 'frockpaperscissors') {
                const playerChoice = args[1].toLowerCase();
                const botChoice = choices[Math.floor(Math.random() * choices.length)];

                if (!choices.includes(playerChoice)) {
                    message.reply('Invalid choice. Please choose rock, paper, or scissors.');
                } else {
                    message.reply(`You chose ${playerChoice}, and I chose ${botChoice}.`);
                    if (playerChoice === botChoice) {
                        message.reply("It's a tie!");
                    } else if (
                        (playerChoice === "rock" && botChoice === "scissors") ||
                        (playerChoice === "scissors" && botChoice === "paper") ||
                        (playerChoice === "paper" && botChoice === "rock")
                    ) {
                        message.reply("You win!");
                    } else {
                        message.reply("I win!");
                    }
                }
            } else if (command === 'fguessnumber') {
                const guess = parseInt(args[1], 10);
                if (isNaN(guess)) {
                    message.reply('Invalid guess. Please provide a valid number.');
                } else {
                    if (guess < secretNumber) {
                        message.reply('Higher!');
                    } else if (guess > secretNumber) {
                        message.reply('Lower!');
                    } else {
                        message.reply(`Congratulations! You guessed the secret number ${secretNumber}.`);
                        generateSecretNumber();
                    }
                }
            }
        });
    });
}


function generateSecretNumber() {
    secretNumber = Math.floor(Math.random() * 10) + 1;
}


getYourUserID();

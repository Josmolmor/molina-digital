export type CreativeStrategy = {
  category: string;
  prompt: string;
};

export const creativeStrategies: CreativeStrategy[] = [
  // Change perspective
  {
    category: 'Change perspective',
    prompt: 'What would the opposite approach look like?',
  },
  {
    category: 'Change perspective',
    prompt: 'What are you assuming must be true?',
  },
  {
    category: 'Change perspective',
    prompt: "What if the thing you're trying to solve isn't the real problem?",
  },
  {
    category: 'Change perspective',
    prompt: 'What would someone encountering this for the first time notice?',
  },
  {
    category: 'Change perspective',
    prompt: 'What would a complete beginner do?',
  },
  {
    category: 'Change perspective',
    prompt: 'What would someone completely outside this field do?',
  },
  {
    category: 'Change perspective',
    prompt: 'What would your harshest critic change first?',
  },
  {
    category: 'Change perspective',
    prompt: 'What would you do if nobody had to approve of it?',
  },
  {
    category: 'Change perspective',
    prompt: 'What would you do if nobody would ever see it?',
  },
  {
    category: 'Change perspective',
    prompt: 'What would your future self tell you to stop worrying about?',
  },
  {
    category: 'Change perspective',
    prompt: 'What would you notice if you stopped trying to make it good?',
  },
  {
    category: 'Change perspective',
    prompt: 'What would happen if you deliberately misunderstood the problem?',
  },
  {
    category: 'Change perspective',
    prompt:
      'What would you do if you had to make this for someone completely different?',
  },
  {
    category: 'Change perspective',
    prompt: 'What would this look like from the other side?',
  },
  {
    category: 'Change perspective',
    prompt:
      'What part of this would be obvious to someone who knows nothing about it?',
  },

  // Reverse it
  {
    category: 'Reverse it',
    prompt: 'What if the opposite were true?',
  },
  {
    category: 'Reverse it',
    prompt: 'Start where you normally finish.',
  },
  {
    category: 'Reverse it',
    prompt: "What if you weren't allowed to do the obvious thing?",
  },
  {
    category: 'Reverse it',
    prompt:
      "What if you had to make the exact opposite of what you're currently making?",
  },
  {
    category: 'Reverse it',
    prompt: 'What would happen if you reversed the order?',
  },
  {
    category: 'Reverse it',
    prompt: 'What if the goal were to achieve the opposite result?',
  },
  {
    category: 'Reverse it',
    prompt: 'What if the limitation became the goal?',
  },
  {
    category: 'Reverse it',
    prompt: 'What if you treated the problem as the solution?',
  },
  {
    category: 'Reverse it',
    prompt: 'What if you deliberately made the wrong choice?',
  },
  {
    category: 'Reverse it',
    prompt: 'What if you stopped trying to solve it?',
  },
  {
    category: 'Reverse it',
    prompt: 'What if you made the problem bigger instead?',
  },
  {
    category: 'Reverse it',
    prompt: 'What if you went backwards?',
  },

  // Remove
  {
    category: 'Remove',
    prompt: 'What can you remove without replacing?',
  },
  {
    category: 'Remove',
    prompt: 'What is the least necessary part?',
  },
  {
    category: 'Remove',
    prompt: 'What happens if you cut it in half?',
  },
  {
    category: 'Remove',
    prompt: 'What happens if you remove your favorite idea?',
  },
  {
    category: 'Remove',
    prompt: 'What would remain if you removed everything except the essential?',
  },
  {
    category: 'Remove',
    prompt: "What are you adding because you're afraid of leaving it empty?",
  },
  {
    category: 'Remove',
    prompt: 'What could disappear and make the whole thing stronger?',
  },
  {
    category: 'Remove',
    prompt: "What if you weren't allowed to add anything else?",
  },
  {
    category: 'Remove',
    prompt: 'Remove the thing doing the most work.',
  },
  {
    category: 'Remove',
    prompt: "Remove the thing you're most certain about.",
  },
  {
    category: 'Remove',
    prompt: 'Remove the first idea you had.',
  },
  {
    category: 'Remove',
    prompt: 'Remove one thing you think is necessary.',
  },

  // Constrain
  {
    category: 'Constrain',
    prompt: 'What would you do if you had ten minutes?',
  },
  {
    category: 'Constrain',
    prompt: 'What would you do if you only had one attempt?',
  },
  {
    category: 'Constrain',
    prompt: 'What if you could only make one decision?',
  },
  {
    category: 'Constrain',
    prompt: 'What if you had to finish today?',
  },
  {
    category: 'Constrain',
    prompt: "What if you weren't allowed to use your usual approach?",
  },
  {
    category: 'Constrain',
    prompt: 'What if you could only use what you already have?',
  },
  {
    category: 'Constrain',
    prompt: 'What if you had to explain the entire idea in one sentence?',
  },
  {
    category: 'Constrain',
    prompt: 'What if you could only keep one element?',
  },
  {
    category: 'Constrain',
    prompt: 'What if you had to make it much smaller?',
  },
  {
    category: 'Constrain',
    prompt: 'What if you had to make it much simpler?',
  },
  {
    category: 'Constrain',
    prompt: 'What if you had to make it much stranger?',
  },
  {
    category: 'Constrain',
    prompt: 'What if you had to make it understandable without explaining it?',
  },
  {
    category: 'Constrain',
    prompt: 'What if you had to make it work under an arbitrary restriction?',
  },
  {
    category: 'Constrain',
    prompt: 'Pick a restriction and obey it completely.',
  },
  {
    category: 'Constrain',
    prompt: "Give yourself a rule you normally wouldn't choose.",
  },

  // Exaggerate
  {
    category: 'Exaggerate',
    prompt: 'Make the smallest part the most important.',
  },
  {
    category: 'Exaggerate',
    prompt: 'Make the weirdest part bigger.',
  },
  {
    category: 'Exaggerate',
    prompt: 'Push the idea until it breaks.',
  },
  {
    category: 'Exaggerate',
    prompt: 'Take the least interesting element and exaggerate it.',
  },
  {
    category: 'Exaggerate',
    prompt: 'Make the subtle thing obvious.',
  },
  {
    category: 'Exaggerate',
    prompt: 'Make the obvious thing absurd.',
  },
  {
    category: 'Exaggerate',
    prompt: 'Make it much more extreme.',
  },
  {
    category: 'Exaggerate',
    prompt: 'What happens if you take the idea literally?',
  },
  {
    category: 'Exaggerate',
    prompt: 'What happens if you take one detail way too seriously?',
  },
  {
    category: 'Exaggerate',
    prompt: 'What would the most excessive version look like?',
  },
  {
    category: 'Exaggerate',
    prompt: 'What would happen if you doubled everything?',
  },
  {
    category: 'Exaggerate',
    prompt: 'What would happen if you removed all restraint?',
  },

  // Follow the accident
  {
    category: 'Follow the accident',
    prompt: 'What happened accidentally that might be worth keeping?',
  },
  {
    category: 'Follow the accident',
    prompt: 'What did you almost dismiss?',
  },
  {
    category: 'Follow the accident',
    prompt: 'What mistake could become intentional?',
  },
  {
    category: 'Follow the accident',
    prompt: 'What happens if you follow the unexpected result?',
  },
  {
    category: 'Follow the accident',
    prompt: 'What if the thing that went wrong is actually interesting?',
  },
  {
    category: 'Follow the accident',
    prompt: 'What did you do without thinking?',
  },
  {
    category: 'Follow the accident',
    prompt: 'Where did the process surprise you?',
  },
  {
    category: 'Follow the accident',
    prompt: 'What happens if you stop correcting the weird part?',
  },
  {
    category: 'Follow the accident',
    prompt: 'Make the mistake bigger.',
  },
  {
    category: 'Follow the accident',
    prompt: 'Trust the accident.',
  },
  {
    category: 'Follow the accident',
    prompt: 'Keep the first thing you wanted to throw away.',
  },
  {
    category: 'Follow the accident',
    prompt: "Follow the part that doesn't make sense yet.",
  },

  // Break your habits
  {
    category: 'Break your habits',
    prompt: 'What are you doing simply because you always do it this way?',
  },
  {
    category: 'Break your habits',
    prompt: "What is your default move? Don't use it.",
  },
  {
    category: 'Break your habits',
    prompt: 'What would you normally reject immediately?',
  },
  {
    category: 'Break your habits',
    prompt: "What would you do if you weren't allowed to repeat yourself?",
  },
  {
    category: 'Break your habits',
    prompt: 'Which part of your process has become automatic?',
  },
  {
    category: 'Break your habits',
    prompt: 'Break one rule you usually follow.',
  },
  {
    category: 'Break your habits',
    prompt: 'Choose the least familiar approach.',
  },
  {
    category: 'Break your habits',
    prompt: 'Do the thing you were about to dismiss.',
  },
  {
    category: 'Break your habits',
    prompt: 'Start somewhere completely different.',
  },
  {
    category: 'Break your habits',
    prompt: 'Change one variable and pretend it was intentional.',
  },
  {
    category: 'Break your habits',
    prompt: 'Abandon your current method.',
  },
  {
    category: 'Break your habits',
    prompt: 'Make the first version deliberately unlike your usual work.',
  },

  // Generate without judging
  {
    category: 'Generate without judging',
    prompt: "Make the version you'd normally reject.",
  },
  {
    category: 'Generate without judging',
    prompt: 'Make three bad versions.',
  },
  {
    category: 'Generate without judging',
    prompt: 'Make the obvious version first, then move past it.',
  },
  {
    category: 'Generate without judging',
    prompt: "What would you make if quality didn't matter?",
  },
  {
    category: 'Generate without judging',
    prompt: "What would you make if you couldn't fail?",
  },
  {
    category: 'Generate without judging',
    prompt: "What would you make if you couldn't succeed?",
  },
  {
    category: 'Generate without judging',
    prompt: "Make something that isn't supposed to work.",
  },
  {
    category: 'Generate without judging',
    prompt: 'Give yourself permission to be wrong.',
  },
  {
    category: 'Generate without judging',
    prompt: 'Stop evaluating. Keep moving.',
  },
  {
    category: 'Generate without judging',
    prompt: 'Make the deliberately stupid version.',
  },
  {
    category: 'Generate without judging',
    prompt: 'Follow the first impulse.',
  },
  {
    category: 'Generate without judging',
    prompt: "Don't improve it yet.",
  },
  {
    category: 'Generate without judging',
    prompt: "Make something before deciding whether it's worth making.",
  },

  // Change scale
  {
    category: 'Change scale',
    prompt: 'What would this look like if it were ten times smaller?',
  },
  {
    category: 'Change scale',
    prompt: 'What would this look like if it were ten times bigger?',
  },
  {
    category: 'Change scale',
    prompt: 'What happens if you focus on only one tiny part?',
  },
  {
    category: 'Change scale',
    prompt: 'What happens if you step back completely?',
  },
  {
    category: 'Change scale',
    prompt: 'What is the smallest possible version?',
  },
  {
    category: 'Change scale',
    prompt: 'What is the largest possible version?',
  },
  {
    category: 'Change scale',
    prompt: 'What if you treated one detail as the whole thing?',
  },
  {
    category: 'Change scale',
    prompt: 'What would matter if everything else disappeared?',
  },
  {
    category: 'Change scale',
    prompt: 'Zoom in.',
  },
  {
    category: 'Change scale',
    prompt: 'Zoom out.',
  },
  {
    category: 'Change scale',
    prompt: 'What changes when you stop thinking about the whole?',
  },

  // Change the question
  {
    category: 'Change the question',
    prompt: 'What are you actually trying to make happen?',
  },
  {
    category: 'Change the question',
    prompt: "What if you're asking the wrong question?",
  },
  {
    category: 'Change the question',
    prompt: 'What question would make this easier?',
  },
  {
    category: 'Change the question',
    prompt: 'What question would make this harder?',
  },
  {
    category: 'Change the question',
    prompt: 'What would you ask if you had no idea how to solve it?',
  },
  {
    category: 'Change the question',
    prompt: 'What are you really stuck on?',
  },
  {
    category: 'Change the question',
    prompt: 'Is the problem generating the work, or preventing it?',
  },
  {
    category: 'Change the question',
    prompt: 'What happens if you replace the goal?',
  },
  {
    category: 'Change the question',
    prompt: 'What if there is no problem to solve?',
  },
  {
    category: 'Change the question',
    prompt: "What would you be doing if you weren't trying to solve this?",
  },
  {
    category: 'Change the question',
    prompt: 'What are you avoiding by staying stuck?',
  },
  {
    category: 'Change the question',
    prompt: 'What would you ask instead?',
  },

  // Use the constraint itself
  {
    category: 'Use the constraint itself',
    prompt: 'Make the limitation the feature.',
  },
  {
    category: 'Use the constraint itself',
    prompt: 'What does the restriction make possible?',
  },
  {
    category: 'Use the constraint itself',
    prompt: 'What can only exist because of this limitation?',
  },
  {
    category: 'Use the constraint itself',
    prompt: 'Stop fighting the constraint.',
  },
  {
    category: 'Use the constraint itself',
    prompt:
      "What happens if you lean into the thing that's getting in your way?",
  },
  {
    category: 'Use the constraint itself',
    prompt: 'What if the hardest part became the starting point?',
  },
  {
    category: 'Use the constraint itself',
    prompt: "What if you couldn't remove the obstacle?",
  },
  {
    category: 'Use the constraint itself',
    prompt: 'What can you do because of the limitation?',
  },
  {
    category: 'Use the constraint itself',
    prompt: 'Turn the problem into a rule.',
  },
  {
    category: 'Use the constraint itself',
    prompt: 'Make the obstacle necessary.',
  },

  // Introduce randomness
  {
    category: 'Introduce randomness',
    prompt: 'Choose the least obvious option.',
  },
  {
    category: 'Introduce randomness',
    prompt: 'Pick something at random and make it relevant.',
  },
  {
    category: 'Introduce randomness',
    prompt: 'Change one thing arbitrarily.',
  },
  {
    category: 'Introduce randomness',
    prompt: 'Let chance decide the next move.',
  },
  {
    category: 'Introduce randomness',
    prompt: "Choose the option you'd normally overlook.",
  },
  {
    category: 'Introduce randomness',
    prompt: "Combine two things that don't belong together.",
  },
  {
    category: 'Introduce randomness',
    prompt: 'Borrow a constraint from somewhere completely unrelated.',
  },
  {
    category: 'Introduce randomness',
    prompt: 'Pick a word. Make it matter.',
  },
  {
    category: 'Introduce randomness',
    prompt: 'Introduce something unexpected.',
  },
  {
    category: 'Introduce randomness',
    prompt: "Do the next thing without deciding whether it's a good idea.",
  },
  {
    category: 'Introduce randomness',
    prompt: 'Let something external make the decision.',
  },

  // Temporal shifts
  {
    category: 'Temporal shifts',
    prompt: 'What would you have done yesterday?',
  },
  {
    category: 'Temporal shifts',
    prompt: 'What will you wish you had done tomorrow?',
  },
  {
    category: 'Temporal shifts',
    prompt: 'What would this look like ten years from now?',
  },
  {
    category: 'Temporal shifts',
    prompt:
      'What would this look like if it had to survive for a hundred years?',
  },
  {
    category: 'Temporal shifts',
    prompt: 'What would you do if you had to finish it today?',
  },
  {
    category: 'Temporal shifts',
    prompt: 'What would you change if you had unlimited time?',
  },
  {
    category: 'Temporal shifts',
    prompt: 'Start from the ending.',
  },
  {
    category: 'Temporal shifts',
    prompt: 'What would have to happen immediately before this?',
  },
  {
    category: 'Temporal shifts',
    prompt: 'What would happen after the obvious ending?',
  },
  {
    category: 'Temporal shifts',
    prompt: "What would you keep if you knew you'd never return to it?",
  },
  {
    category: 'Temporal shifts',
    prompt: "What would you abandon if you knew you'd come back tomorrow?",
  },

  // Question your attachment
  {
    category: 'Question your attachment',
    prompt: 'What are you trying too hard to preserve?',
  },
  {
    category: 'Question your attachment',
    prompt: 'What are you unwilling to change?',
  },
  {
    category: 'Question your attachment',
    prompt: 'What part are you protecting?',
  },
  {
    category: 'Question your attachment',
    prompt: 'What idea are you attached to?',
  },
  {
    category: 'Question your attachment',
    prompt: 'What would happen if you let it go?',
  },
  {
    category: 'Question your attachment',
    prompt: 'Which part are you defending instead of questioning?',
  },
  {
    category: 'Question your attachment',
    prompt: "What would you remove if you weren't emotionally attached to it?",
  },
  {
    category: 'Question your attachment',
    prompt: 'What are you afraid of losing?',
  },
  {
    category: 'Question your attachment',
    prompt:
      "What if the thing you're protecting is holding everything else back?",
  },
  {
    category: 'Question your attachment',
    prompt: 'What are you trying to prove?',
  },
  {
    category: 'Question your attachment',
    prompt: 'What would happen if you stopped proving it?',
  },

  // Get uncomfortable
  {
    category: 'Get uncomfortable',
    prompt: "Do the thing you're avoiding.",
  },
  {
    category: 'Get uncomfortable',
    prompt: 'Choose the uncomfortable option.',
  },
  {
    category: 'Get uncomfortable',
    prompt: 'Make the decision you keep postponing.',
  },
  {
    category: 'Get uncomfortable',
    prompt: "What would you do if you couldn't hide behind refinement?",
  },
  {
    category: 'Get uncomfortable',
    prompt: "What would you make if you weren't trying to impress anyone?",
  },
  {
    category: 'Get uncomfortable',
    prompt: 'What feels too obvious, too simple, or too strange to try?',
  },
  {
    category: 'Get uncomfortable',
    prompt: "What are you afraid won't work?",
  },
  {
    category: 'Get uncomfortable',
    prompt: "Try the thing you don't want to try.",
  },
  {
    category: 'Get uncomfortable',
    prompt: 'Say the uncomfortable thing.',
  },
  {
    category: 'Get uncomfortable',
    prompt: 'Make the choice that creates the most uncertainty.',
  },
  {
    category: 'Get uncomfortable',
    prompt: 'Stop making it safe.',
  },

  // Finish something
  {
    category: 'Finish something',
    prompt: 'Stop improving it. Finish it.',
  },
  {
    category: 'Finish something',
    prompt: 'What would "done" look like?',
  },
  {
    category: 'Finish something',
    prompt: 'What is the smallest version you could finish right now?',
  },
  {
    category: 'Finish something',
    prompt: 'What can you decide permanently?',
  },
  {
    category: 'Finish something',
    prompt: "What doesn't need to be solved yet?",
  },
  {
    category: 'Finish something',
    prompt: 'What are you keeping unfinished unnecessarily?',
  },
  {
    category: 'Finish something',
    prompt: 'Finish the bad version.',
  },
  {
    category: 'Finish something',
    prompt: 'Make a decision and move on.',
  },
  {
    category: 'Finish something',
    prompt: 'What would you ship if you had to stop thinking?',
  },
  {
    category: 'Finish something',
    prompt: "What remains unfinished because you're waiting for certainty?",
  },
  {
    category: 'Finish something',
    prompt: 'Complete something before starting something else.',
  },

  // Make a move — single instructions in the spirit of the original Oblique
  // Strategies: act on the card instead of reasoning about it.
  {
    category: 'Make a move',
    prompt: 'Trust the first move.',
  },
  {
    category: 'Make a move',
    prompt: 'Go around the problem.',
  },
  {
    category: 'Make a move',
    prompt: 'Make the wrong thing work.',
  },
  {
    category: 'Make a move',
    prompt: "Don't fix it yet.",
  },
  {
    category: 'Make a move',
    prompt: 'Start again, differently.',
  },
  {
    category: 'Make a move',
    prompt: 'Honor the mistake.',
  },
  {
    category: 'Make a move',
    prompt: 'Remove the obvious.',
  },
  {
    category: 'Make a move',
    prompt: 'Change the rhythm.',
  },
  {
    category: 'Make a move',
    prompt: 'Do less.',
  },
  {
    category: 'Make a move',
    prompt: 'Make it stranger.',
  },
  {
    category: 'Make a move',
    prompt: 'Leave something unresolved.',
  },
  {
    category: 'Make a move',
    prompt: 'Follow the distraction.',
  },
  {
    category: 'Make a move',
    prompt: 'Use what you have.',
  },
  {
    category: 'Make a move',
    prompt: 'Begin with the difficult part.',
  },
  {
    category: 'Make a move',
    prompt: 'Abandon the strongest idea.',
  },
  {
    category: 'Make a move',
    prompt: 'Make the constraint visible.',
  },
  {
    category: 'Make a move',
    prompt: 'Let something else decide.',
  },
  {
    category: 'Make a move',
    prompt: 'Stop protecting the idea.',
  },
  {
    category: 'Make a move',
    prompt: 'Take it literally.',
  },
  {
    category: 'Make a move',
    prompt: 'Take it too far.',
  },
  {
    category: 'Make a move',
    prompt: 'Go backwards.',
  },
  {
    category: 'Make a move',
    prompt: 'Break your own rule.',
  },
  {
    category: 'Make a move',
    prompt: 'Make the familiar unfamiliar.',
  },
  {
    category: 'Make a move',
    prompt: 'Find the unnecessary.',
  },
  {
    category: 'Make a move',
    prompt: 'Keep the accident.',
  },
  {
    category: 'Make a move',
    prompt: 'Do the opposite.',
  },
  {
    category: 'Make a move',
    prompt: 'Change the question.',
  },
  {
    category: 'Make a move',
    prompt: 'Start smaller.',
  },
  {
    category: 'Make a move',
    prompt: 'Start bigger.',
  },
  {
    category: 'Make a move',
    prompt: "Don't optimize.",
  },
  {
    category: 'Make a move',
    prompt: 'Make a bad version.',
  },
  {
    category: 'Make a move',
    prompt: 'Follow the strange part.',
  },
  {
    category: 'Make a move',
    prompt: 'Leave the first idea behind.',
  },
  {
    category: 'Make a move',
    prompt: 'Make the problem useful.',
  },
  {
    category: 'Make a move',
    prompt: 'Stop looking for the answer.',
  },
];

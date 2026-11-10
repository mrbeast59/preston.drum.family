---
layout: page
short_title: Studying
title: Studying Material
permalink: /studying/
---

Two subjects to study from here. Open one to see its topics, practice links, and
this week's work.

<style>
  .StudyMenu {
    margin: 1.25rem 0 0;
  }
  .StudyMenu-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 0.9rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .StudyMenu-link {
    display: flex;
    height: 100%;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1.15rem 1.25rem;
    border: 1.5px solid rgba(127, 127, 127, 0.4);
    border-radius: 14px;
    background: rgba(127, 127, 127, 0.06);
    color: inherit;
    text-decoration: none;
    transition: border-color 0.15s ease, transform 0.15s ease;
  }
  .StudyMenu-link:hover {
    border-color: #2f855a;
    transform: translateY(-2px);
  }
  .StudyMenu-link:focus-visible {
    outline: 3px solid #2f855a;
    outline-offset: 3px;
  }
  .StudyMenu-link::after {
    content: "Open →";
    margin-top: auto;
    padding-top: 0.55rem;
    font-size: 0.8rem;
    font-weight: 700;
    opacity: 0.65;
  }
  .StudyMenu-link:hover::after {
    opacity: 0.95;
  }
  .StudyMenu-name {
    font-size: 1.2rem;
    font-weight: 700;
  }
  .StudyMenu-desc {
    font-size: 0.9rem;
    line-height: 1.5;
    opacity: 0.78;
  }
  @media (prefers-reduced-motion: reduce) {
    .StudyMenu-link {
      transition: none;
    }
  }
</style>

## Subjects

<nav class="StudyMenu" aria-label="Study subjects">
  <ul class="StudyMenu-list">
    <li>
      <a class="StudyMenu-link" href="/studying/spanish/">
        <span class="StudyMenu-name">Spanish</span>
        <span class="StudyMenu-desc">Greetings, numbers, family words, and the present tense</span>
      </a>
    </li>
    <li>
      <a class="StudyMenu-link" href="/studying/biology/">
        <span class="StudyMenu-name">Biology</span>
        <span class="StudyMenu-desc">The Chapter 4 energy week and the 17 vocabulary cards</span>
      </a>
    </li>
  </ul>
</nav>

## Study routine

1. **Recall first.** Close the notes and write down what you remember. Checking
   your answer afterwards is what makes it stick.
2. **Space it out.** Revisit a topic after a day, then after a week, instead of
   doing it all in one sitting.
3. **Work in short blocks.** Study for 25 minutes, take a 5 minute break, then
   start the next block.
4. **Mix the problems.** Do a few different kinds of problems in one session so
   you have to decide which method to use.
5. **Sleep on it.** Sleep is when the practice turns into memory.

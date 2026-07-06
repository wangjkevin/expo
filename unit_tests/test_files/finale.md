# Extra Practice Problems! 🎯

<div class="byline">_Written by Kevin Wang_
kevjwang@stanford.edu
</div>

\(\text{some math } x \cdot 2\) test test test

Hi scholars! As we near the final, I wanted to give you all more opportunities to practice your CS106B skillz! At its heart, computer science can be described as the study of games. Hence, these problems are all game-themed! I hope you enjoy, and I hope you'll try out one of these games--perhaps now, or after the final!

<div class="checkpoint">_**Checkpoint:** These problems are quite challenging! <span style="font-size: 8pt;">Consider tackling these problems after finishing and thoroughly understanding the provided practice tests!_</span></div>



## Backtracking: Solving _Connections!_

You've probably heard of it: the notorious [Connections](https://www.google.com/url?q=https://www.nytimes.com/games/connections/&sa=D&source=editors&ust=1773223570887454&usg=AOvVaw0_6U8AoLRAzmDed6CYz0UP) puzzle, infamously crafted by puzzle creator [Wyna Liu](https://www.google.com/url?q=https://www.wynaliu.com/about&sa=D&source=editors&ust=1773223570887617&usg=AOvVaw2xsPg0-ogXL968MUoY0pSv) and released daily by the New York Times. In Connections, your goal is to form four groups of four items each, where each group shares something in common. There's always exactly one solution for each puzzle, and each group is more difficult than the previous. If you haven't played this game before, try solving today's puzzle! Chances are it's not that easy. This experience of frustration will form the backbone of this problem. >:-)

As a primer, Connections is played in a 4x4 grid, and your goal is to form four semantically-tight groups of four words. For example, here's the puzzle for March 9, 2026:

<img src="https://stanford.edu/~kevjwang/cs106b/finale/images/image7.png" width="476" height="277">

And here's the solution:

<img src="https://stanford.edu/~kevjwang/cs106b/finale/images/image5.png" width="485" height="267">

In this problem, you'll be writing the following function:

```
bool solvePuzzle(Set<string> words, Set<Set<string>> &categories);
```

where you'll go through every possible combination of categories until you reach the official solution. You'll know that you have the true, official solution if this provided function:

```
bool wynaApproved(Set<Set<string>> categories);
```

returns `true`.

<div class="solution">
```
const int NUM_WORDS_PER_GROUP = 4;


bool solvePuzzle(Set<string> words, Set<Set<string>> &categories) {
    // base case: all words assigned
    if (words.isEmpty()) {
        return wynaApproved(categories);
    }


    // try every possible group of 4 words
    for (string w1 : words) {
        for (string w2 : words) {
            for (string w3 : words) {
                for (string w4 : words) {

                    Set<string> group;
                    group.add(w1);
                    group.add(w2);
                    group.add(w3);
                    group.add(w4);

                    // ensure exactly 4 unique words
                    if (group.size() != NUM_WORDS_PER_GROUP) {
                        continue;
                    }


                    // choose
                    categories.add(group);

                    Set<string> remaining = words;
                    for (string w : group) {
                        remaining.remove(w);
                    }

                    // explore
                    if (solvePuzzle(remaining, categories)) {
                        return true;
                    }

                    // unchoose
                    categories.remove(group);
                }
            }
        }
    }

    return false;
}
```
</div>



## Linked Lists and Exploding Kittens!

[Exploding Kittens](https://www.google.com/url?q=https://cdn.shopify.com/s/files/1/0345/9180/1483/files/ekoe-instructions-english.pdf?v%3D1743802429&sa=D&source=editors&ust=1773223570896694&usg=AOvVaw34PZNWvPPzr-fxL5Vt_Wp7) is a card game where players continue to draw cards from a pile until they draw an Exploding Kitten, at which point, the person who drew the card is out.

<img src="https://stanford.edu/~kevjwang/cs106b/finale/images/image1.png" width="300.5" height="300.5">
<p class="center">_Some of the cards in Exploding Kittens!_</p>

There's an important preprocessing step when playing this game, which is going to be the focus of this problem. Before the start of every game, we'll need to take out all the Exploding Kittens in this deck of cards so that we can reinsert them back in.

We'll represent the deck of cards as a singly-linked list. The struct for each element in this list is similar to what you've seen before, except that instead of storing a value, we'll store a true/false indicator of whether the card is an exploding kitten or not.

```
struct Card {
    bool isExplodingKitten;
    Card* next;
};
```

Your task is to remove all the exploding kitten cards in the deck of cards passed in, and return a new linked list of these exploding kittens.

```
Card* diffuse(Card* &deck);
```

Don't create or destroy any new nodes in this problem. Simply rewire and transfer these exploding kitten cards into this new list, which is the return value of this function.

Have fun with this problem! Rewire with grace, and you'll successfully diffuse all the exploding kittens from the deck. :-)

<div class="solution">
```
Card* remove(Card* &deck, Card* prev, Card* curr) {
    Card* next = curr->next;

    // are we at the front of the deck?
    if (prev == nullptr) {
        deck = next;
    }
    // if not, just pretend it never existed and hop over to the next card
    else {
        prev->next = next;
    }

    // return the now severed card
    return curr;
}

void add(Card* card, Card* &list) {
    card->next = nullptr;

    // empty list? this card becomes the first card
    if (list == nullptr) {
        list = card;
    }

    // otherwise, we traverse to the end
    else {
        // traverse to the end of the list
        Card* curr = list;
        while (curr->next != nullptr) {
            curr = curr->next;
        }
        curr->next = card;  // add card at the end
    }
}

Card* diffuse(Card* &deck) {
    Card* kittens = nullptr;
    Card* prev = nullptr;
    Card* curr = deck;
    while (curr != nullptr) {
        if (curr->isExplodingKitten) {
            // STEP 1: remove the kitten from the deck
            Card* kitten = remove(deck, prev, curr);

            // STEP 2: add the kitten to the kittens list
            add(kitten, kittens);

            // STEP 3: determine where to go next;
            //         we can't just do curr = curr->next here, as curr is
            //         still that removed node
            // at the front?
            if (prev == nullptr) {
                curr = deck;
            }
            // otherwise, we can move to the next card, which is prev->next
            else {
                curr = prev->next;
            }
        }
        else {
            prev = curr;
            curr = curr->next;
        }
    }
    return kittens;
}
```
</div>



## Champion of Memory Diagrams: Minecraft Championship

There's a really popular, monthly Minecraft tournament, hosted by [Noxcrew](noxcrew.com/mcc) and [Scott Smajor](youtube.com/dangthatsalongname), called [Minecraft Championship](mcc.live), where 40 beloved Minecraft content creators are split into 10 teams of four to compete for the crown. They compete across a variety of minigames: the infamous [Parkour Warrior](https://www.youtube.com/watch?v=Rx_L1SbZ14k), the intense [Meltdown](https://www.youtube.com/watch?v=SbOrZFyKt2k), and the classic [Bingo But Fast](https://www.youtube.com/watch?v=IcuWBsYF9C4).

<img src="https://stanford.edu/~kevjwang/cs106b/finale/images/image2.png" width="350.5" height="198">
<p class="center">_Minecraft Championship's logo overlaid on top of the Decision Dome._</p>

In this problem, you'll draw out a memory diagram of the stack and the heap after the following lines of code execute. Succeed, and you might find yourself on the throne! 👑

```
struct Minigame {
    string name;
    bool isPlayed;
};

Minigame* games = new Minigame[3];

Minigame* meltdown = &(games[0]);
meltdown->name = "Meltdown";
meltdown->isPlayed = false;

Minigame bingo = {"Bingo But Fast", false};
Minigame* currentGame = &bingo;
currentGame->isPlayed = true;

games[2].name = "Parkour Warrior";
bool* ptr = &(games[2].isPlayed);
*ptr = false;

delete[] games;
```

<div class="solution">
<img src="https://stanford.edu/~kevjwang/cs106b/finale/images/image3.png" width="610" height="373">
</div>



## Binary Space Partioning in _Doom_

_Doom_ (1993) is one of those canonical video games that completely transfigured the video game landscape. It's considered the first first-person shooter (FPS), and it revolutionized the development of game engines, as well as set up the form of the FPS (just like the structure of a novel) that would reverberate throughout every FPS game out there, like Valorant or CS:GO.

<img src="https://stanford.edu/~kevjwang/cs106b/finale/images/image4.png" width="348.5" height="261">
_For 1993, these graphics are incredible! For reference, the public release of the World Wide Web was in 1993. :O_

In this problem, we'll explore one of Doom's secrets to fast rendering: **binary space partitioning**.

It's expensive to load up the entire physical map of a game. For example, in Minecraft, you wouldn't render the entire world, which would contain **quadrillions**! of blocks. Instead, we only render to the screen what we need to. Binary space partitioning is a way of deciding what to render so that we only render what we need to, nothing more.

We start with a large space, like the entire map of Doom. Then, we recursively divide this space into two regions—exactly like a binary tree! If we're on the right-hand side of this map, we should only render stuff in the right region, and if we're on the left-hand side of this map, we should only render stuff in the left region. If we continue this, we'll have multiple smaller regions of our map rendered "on-the-fly" rather than the whole map—how cool is that!

Here's an example of a BSP tree of a hotel:

<img src="https://stanford.edu/~kevjwang/cs106b/finale/images/image6.png" width="463" height="231">
Rendering the entire hotel map would be expensive, so instead, we divide the map into specific regions. Each arrow can be thought of as a corridor or a door. For example, to enter the Kitchen, you know you'll have to enter through the Diner first, and then walk into the Kitchen. To get to the Second Floor, you'll have to take the Elevator first, which'll then lead you to the Second Floor. You can assume that everyone starts at the Lobby.

With the following struct:

```
struct BSPNode {
    string room;
    BSPNode* left;  
    BSPNode* right;
};
```

In this problem, you'll implement the following function:

```
Vector<string> findShortestPathTo(string room, BSPNode* root);
```


Your goal is to find the shortest path to the room specified. For example, if `room` was `"Kitchen"`, the shortest path would be:

```
{"Lobby", "Diner", "Kitchen"}
```

since we start at the Lobby, and can choose to go to the Diner, and then end up at the Kitchen.


As another example, if room was `"Second Floor"`, we should `return`:

```
{"Lobby", "Elevator", "Second Floor"}
```

This would mean that if a player were planning on traveling straight to the Second Floor, we would only have to render three rooms rather than all six! How cool is that!

💡 Hint: Consider BFS!   On which assignment did you code up BFS from scratch?

<div class="solution">
```
Vector<string> convertToNames(Vector<BSPNode*> path) {
    Vector<string> rooms = {};

    for (BSPNode* node : path) {
        rooms.add(node->room);
    }

    return rooms;
}

Vector<string> findShortestPathTo(string room, BSPNode* root) {
    // handle the pesky edge case of the empty list >:)
    if (root == nullptr) {
        return {};
    }

    // bread and butter with BFS:
    //     (1) have a queue of paths (to enable that radiating behavior),
    //     (2) and keep track of the nodes we've visited
    Queue<Vector<BSPNode*>> allPaths = {};
    Set<BSPNode*> visited = {};

    // start with the root node
    allPaths.enqueue({root});

    // now, we begin the BFS algorithm! :O
    while (!allPaths.empty()) {
        Vector<BSPNode*> currentPath = allPaths.dequeue();
        BSPNode* lastNodeInPath = currentPath[currentPath.size() - 1];

        // have we found it?!
        if (lastNodeInPath->room == room) {
            return convertToNames(currentPath);
        }
        // if not, go to the left...
        if (lastNodeInPath->left != nullptr &&
!visited.contains(lastNodeInPath->left)) {
            Vector<BSPNode*> leftPath = currentPath;
            leftPath.add(lastNodeInPath->left);
            allPaths.enqueue(leftPath);

            visited.add(lastNodeInPath->left);
        }
        // ...and go to the right...!
        if (lastNodeInPath->right != nullptr && !visited.contains(lastNodeInPath->right)) {
            Vector<BSPNode*> rightPath = currentPath;
            rightPath.add(lastNodeInPath->right);
            allPaths.enqueue(rightPath);

            visited.add(lastNodeInPath->right);
        }
    }

    // oh no! the room doesn't exist!
    return {};
}
```
</div>
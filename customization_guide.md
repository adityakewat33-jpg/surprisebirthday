# Personalized Content Customization Guide

This guide makes it easy to find and replace the website text with your own personal messages, inside the file:
📂 [**`index.html`**](file:///Users/rahulkewat/.gemini/antigravity/scratch/luxury-birthday-trip/index.html)

Open `index.html` in your text editor and jump to the following line numbers to edit:

---

### 1. Countdown Lock Screen (Gatekeeper)
* **Location**: Lines 40 to 68
* **What you can change**: 
  * The title: `Your Birthday Surprise Unlocks In...` (Line 45)
  * The footer text: `Waiting for August 17, 2026 ✨` (Line 66)
  * *Note: To edit the target date check, open [`scripts/main.js`](file:///Users/rahulkewat/.gemini/antigravity/scratch/luxury-birthday-trip/scripts/main.js#L847) and update the date string.*

### 2. Timeline Milestones ("Our Journey")
* **Location**: Lines 140 to 300
* **What you can change**:
  * Edit the dates (e.g., `The Day We Met Online` on Line 152).
  * Edit the titles (e.g., `A Spark Across the Network` on Line 153).
  * Edit the description text on Lines 154, 166, 178, etc.

### 3. "12 Reasons Why I Love You" (Flipping Cards)
* **Location**: Lines 410 to 575
* **What you can change**:
  * The titles of the front of the card: `Your Smile` (Line 414), `Your Kindness` (Line 428), etc.
  * The paragraph descriptions (rear of the card) on Lines 419, 433, 447, etc.

### 4. The Handwritten Love Letter
* **Location**: Lines 675 to 690
* **What you can change**:
  * The greeting: `My Dearest,` (Line 675)
  * The core letter body on Lines 677 to 688.
  * The sign-off: `Your Favorite Person ❤️` (Line 690)

### 5. "Our Pending Things" (Bucket List Bubbles)
* **Location**: Lines 700 to 760
* **What you can change**:
  * Tapping emoji icons (e.g., `🤝` on Line 715, `🌅` on Line 726).
  * Hover titles: `Our First Meeting` (Line 716), `Watching Sunsets` (Line 727), etc.
  * Bubble subtitles/descriptions on Lines 717, 728, 739, etc.

### 6. Final Birthday Wishes & Heart Reveal
* **Location**: Lines 900 to 935
* **What you can change**:
  * Title: `Happy Birthday, My Love ❤️` (Line 901)
  * Paragraphs: `Through every mile...` (Line 903)
  * Pulsate heart subtext: `Tap my heart...` (Line 930)

---

## How to Save & Push Your Updates
Once you are done editing and saving `index.html`, open your Terminal, navigate to the folder, and run:

```bash
git add .
git commit -m "Personalize birthday messages and memories"
git push origin main
```
Your live link will automatically update in 30 seconds!

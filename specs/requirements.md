## Goal

Create a tool that will help to track evidence in Demonology at 4.07 difficulty.

## Features

v1

- see a list of ghosts
- see a list of evidence
- filter list of ghosts based on collected evidence
- filter list of evidence that matches excluded ghosts based on collected evidence
- reset state to start a new round

v2

- multiple suspected ghosts can be selected, only the evidence related to that ghosts should be displayed

v3

- every piece of evidence should have 3 statuses - unconfirmed, confirmed true, confirmed false

v4

- list allows multiple users to collaborate in a single session

## Ghosts

- Aswang
- Banshee
- Demon
- Doppelganger
- Dullahan
- Dybbuk
- Entity
- Ghoul
- Keres
- Leviathan
- Nightmare
- Oni
- Phantom
- Ravager
- Revenant
- Shadow
- Siren
- Specter
- Spirit
- Umbra
- Vesper
- Vex
- The wisp
- Wraith
- Wretch

## Evidence

- walking
    - speed increases after every kill - aswang
    - sprints during hunt - oni
    - speed decreases after every kill - keres
    - moves faster when invisible during the hunt - phantom
    - moves faster the longer they see the target - dullahan
    - teleports - entity
    - stands still when not hunting - specter
    - speed increases if average energy level below 50% - wretch
    - speed decreases in the warm room - umbra
    - can walk through fire - the wisp
    - passes through walls - vex
    - footsteps sound - not umbra
- hunting
    - hunts frequently - demon
    - hunts more frequently in the dark - nightmare
    - ~~low hunt cooldown - revenant~~
    - does not kill while standing still - vesper
    - hunt stops after a kill - revenant
    - target hunters with the lowest energy level - keres
    - start a hunt only in their favorite room - the wisp
    - appears headless in photos - dullahan
    - lifts the cross during hunt - demon
    - switch on electronics during the hunt - not ghoul
    - male skin - not siren and not keres
    - starts the hunt near a lit flame - not wretch
    - alter flame color - spirit
    - starts hunt after spamming spirit box - ghoul
    - blinks consistently - phantom
    - things vortex - ravager
    - big delays between throwing items - entity
    - distinct banshee wail - banshee
- not hunting
    - footprint in salt - not wraith
    - starts candle fire - wisp
    - teleports things - entity
    - throws corpses after killing - dybbuk
    - humming in the spirit box - sirena
    - ghost orb visible - doppelganger
    - mimics others’ abilities - doppelganger
    - leave EMF level 5 - ravager
    - temperature between 0.04-0.08℃ - shadow
    - female voice in spirit box - keres or siren
    - disable lights outside of hunts - leviathan
    - get stunned for 3 seconds while music box is played - dybbuk
    - visible on LIDAR scans - not vex
    - sound hallucinations - nightmare

## Architecture

- static HTML page with JavaScript hosted on Github Pages

## Design

- styled like an open old book with one page having demon list and another page having evidence
- mobile friendly
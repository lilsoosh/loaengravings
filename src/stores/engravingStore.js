import { readable } from 'svelte/store';
import { writable } from 'svelte/store';

window.onerror = () => {
        alert("Error loading page. Local storage cleared.");
        localStorage.clear();
};

const retrievedSelectedPreset = window.localStorage.getItem("selectedPreset");
export const SelectedPreset = writable(retrievedSelectedPreset === null ? 0 : retrievedSelectedPreset);
SelectedPreset.subscribe(value => {
        window.localStorage.setItem("selectedPreset", value);
});

const retrievedSelectedPresetName = window.localStorage.getItem("selectedPresetName");
export const SelectedPresetName = writable(retrievedSelectedPresetName === null ? '' : retrievedSelectedPresetName);
SelectedPresetName.subscribe(value => {
        window.localStorage.setItem("selectedPresetName", value);
});

const retrievedSelectedClass = window.localStorage.getItem("advclass");
export const SelectedClass = writable(retrievedSelectedClass === null ? 'Choose Class' : retrievedSelectedClass);
SelectedClass.subscribe(value => {
        window.localStorage.setItem("advclass", value);
});

const retrievedSelectedEngravings = JSON.parse(window.localStorage.getItem("engravings"));
export const SelectedEngravings = writable(retrievedSelectedEngravings === null ? [] : retrievedSelectedEngravings);
SelectedEngravings.subscribe(value => {
        window.localStorage.setItem("engravings", JSON.stringify(value));
});

const defaultNegEngravings = [
        {id:-1, engraving:'Atk. Power Reduction', nodes:['-','-','-','-','-','-','-']},
        {id:-2, engraving:'Atk. Speed Reduction', nodes:['-','-','-','-','-','-','-']},
        {id:-3, engraving:'Defense Reduction', nodes:['-','-','-','-','-','-','-']},
        {id:-4, engraving:'Move Speed Reduction', nodes:['-','-','-','-','-','-','-']}
]
const retrievedNegativeEngravings = JSON.parse(window.localStorage.getItem("negatives"));
export const NegativeEngravings = writable(retrievedNegativeEngravings === null ? defaultNegEngravings : retrievedNegativeEngravings);
NegativeEngravings.subscribe(value => {
        window.localStorage.setItem("negatives", JSON.stringify(value));
});

export const SurClassStore = readable(['Warrior', 'Martial Artist', 'Gunner', 'Mage', 'Assassin']);

export const ClassStore = readable([
        ['Berserker', 'Paladin', 'Gunlancer', 'Destroyer'],
        ['Striker', 'Wardancer', 'Scrapper', 'Soulfist', 'Glaivier'],
        ['Gunslinger', 'Artillerist', 'Deadeye', 'Sharpshooter'],
        ['Bard', 'Sorceress', 'Arcanist'],
        ['Shadowhunter', 'Deathblade']
]);

export const CombatEngravingStore = readable(['Adrenaline', 'All-Out Attack', 'Ambush Master', 'Awakening', 'Barricade', 'Broken Bone', 'Contender', 'Crisis Evasion', 'Crushing Fist', 'Cursed Doll', 'Disrespect', 'Divine Protection', 'Drops of Ether', 'Emergency Rescue', 'Enhanced Shield', 'Ether Predator', 'Expert', 'Explosive Expert', 'Fortitude', 'Grudge', 'Heavy Armor', 'Hit Master', 'Keen Blunt Weapon', 'Lightning Fury', 'Magick Stream', 'Mass Increase', 'Master Brawler', 'Master of Escape', 'Master\'s Tenacity', 'Max MP Increase', 'MP Efficiency Increase', 'Necromancy', 'Precise Dagger', 'Preemptive Strike', 'Propulsion', 'Raid Captain', 'Shield Piercing', 'Sight Focus', 'Spirit Absorption', 'Stabilized Status', 'Strong Will', 'Super Charge', 'Vital Point Hit']);

export const ClassEngravingStore = readable([
        {name: 'Berserker', engravings: ['Berserker\'s Technique', 'Mayhem']},
        {name: 'Paladin', engravings: ['Blessed Aura', 'Judgment']},
        {name: 'Gunlancer', engravings: ['Combat Readiness', 'Lone Knight']},
        {name: 'Destroyer', engravings: ['Gravity Training', 'Rage Hammer']},
        {name: 'Striker', engravings: ['Deathblow', 'Esoteric Flurry']},
        {name: 'Wardancer', engravings: ['Esoteric Skill', 'First Intention']},
        {name: 'Scrapper', engravings: ['Shock Training', 'Ultimate Skill: Taijutsu']},
        {name: 'Soulfist', engravings: ['Energy Overflow', 'Robust Spirit']},
        {name: 'Glaivier', engravings: ['Control', 'Pinnacle']},
        {name: 'Gunslinger', engravings: ['Peacemaker', 'Time to Hunt']},
        {name: 'Artillerist', engravings: ['Barrage Enhancement', 'Firepower Enhancement']},
        {name: 'Deadeye', engravings: ['Enhanced Weapon', 'Pistoleer']},
        {name: 'Sharpshooter', engravings: ['Death Strike', 'Loyal Companion']},
        {name: 'Bard', engravings: ['Desperate Salvation', 'True Courage']},
        {name: 'Sorceress', engravings: ['Igniter', 'Reflux']},
        {name: 'Arcanist', engravings: ['Empress\'s Grace', 'Order of the Emperor']},
        {name: 'Shadowhunter', engravings: ['Demonic Impulse', 'Perfect Surpression']},
        {name: 'Deathblade', engravings: ['Remaining Energy', 'Surge']}
]);

export default SelectedEngravings;
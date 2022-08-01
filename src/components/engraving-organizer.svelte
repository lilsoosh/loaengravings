<script>
    import { onMount } from 'svelte';
    import ClassDropdown from '../shared/classDropdown.svelte';
    import EngravingRow from './engraving-row.svelte';
    import PresetNameInput from '../shared/presetNameInput.svelte';
    import PresetsList from '../shared/presetsList.svelte';
    import ImportExportButton from '../shared/importExportButton.svelte';
    import ImportExportModal from '../shared/importExportModal.svelte';
    import ClearData from '../shared/clearData.svelte';
    import { SelectedClass } from '../stores/engravingStore';
    import { SelectedPresetName } from '../stores/engravingStore';
    import { SelectedEngravings } from '../stores/engravingStore';
    import { NegativeEngravings } from '../stores/engravingStore';


    onMount(() => {
        changeClassIcon();
    });

    let classIconURL = "";
    const changeClassIcon = (advClass) => {
        classIconURL = $SelectedClass.toLowerCase().replace(" ", "");
        classIconURL = './images/class_icons/png/' + classIconURL + ".png";
    };
    $:{changeClassIcon($SelectedClass)}

    let modalActive = false;
    const toggleModal = () => {
        modalActive = !modalActive;
    };
</script>

<ImportExportModal on:click={toggleModal} {modalActive}/>
<div class="class-container">
    <div class="class-icon-container">
    {#if $SelectedClass != "Choose Class"}
        <img src={classIconURL} alt="Class Icon" class="class-icon">
    {/if}
    </div>
    <div class="class-dropdown-container">
        <ClassDropdown value={$SelectedClass} on:valueChange={changeClassIcon}/>
    </div>
    <div class="preset-name-container">
        <PresetNameInput inputValue={$SelectedPresetName}/>
    </div>
    <div class="presets-container">
        <div class="presets-list"><PresetsList numberOfPresets={6}/></div>
        <div class="import-export-button"><ImportExportButton on:click={toggleModal}/></div>
    </div>
</div>
<table>
    <tr>
        <th class="engraving-selection-head top-head"><h3 class="combat-engravings-h3">Combat Engravings</h3></th>
        <th class="engraving-nodes-head top-head"><h3>Lv.1</h3></th>
        <th class="engraving-nodes-head top-head"><h3>Lv.2</h3></th>
        <th class="engraving-nodes-head top-head"><h3>Lv.3</h3></th>
        <th class="engraving-nodes-extra-head top-head"><h3>+</h3></th>
        <th class="equipment-header top-head">
            <img src="./images/rarity_bgs/leg_bg.png" alt="Legendary Item Background" class="rarity-img">
            <img src="./images/equipment/leg_engravingbook.png" alt="Engraving Books" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="./images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="./images/equipment/relic_necklace.png" alt="Necklace" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="./images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="./images/equipment/relic_earring.png" alt="Earring1" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="./images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="./images/equipment/relic_earring.png" alt="Earring2" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="./images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="./images/equipment/relic_ring.png" alt="Ring1" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="./images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="./images/equipment/relic_ring.png" alt="Ring2" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="./images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="./images/equipment/relic_stone.png" alt="Ability Stone" class="equipment-img">
        </th>
    </tr>
    {#each $SelectedEngravings as engravingRow (engravingRow.id)}
        <EngravingRow engraving={engravingRow.engraving} id={engravingRow.id} engravingNodes={engravingRow.nodes}/>
    {/each}
    <EngravingRow addEngravingRow={true}/>
    <tr>
        <th class="engraving-selection-head"><h3 class="combat-engravings-h3">Negative Engravings</h3></th>
        <th class="engraving-nodes-head"><h3>Lv.1</h3></th>
        <th class="engraving-nodes-head"><h3>Lv.2</h3></th>
        <th class="engraving-nodes-head"><h3>Lv.3</h3></th>
        <th class="engraving-nodes-extra-head"><h3>+</h3></th>
        <th class="equipment-header"></th>
        <th class="equipment-header"></th>
        <th class="equipment-header"></th>
        <th class="equipment-header"></th>
        <th class="equipment-header"></th>
        <th class="equipment-header"></th>
        <th class="equipment-header"></th>
    </tr>

    {#each $NegativeEngravings as engravingRow (engravingRow.id)}
        <EngravingRow engraving={engravingRow.engraving} id={engravingRow.id} engravingNodes={engravingRow.nodes} negativeEngraving=true/>
    {/each}
</table>
<div class="clear-data-button"><ClearData/></div>

<style>
    .class-container{
        position: relative;
        text-align: left;
        height: 50px;
        margin-bottom: 10px;
    }

    .class-dropdown-container{
        display: inline-flex;
        vertical-align: middle;
    }

    .preset-name-container{
        display: inline-flex;
        vertical-align: middle;
        margin: 0px 20px;
    }

    .class-icon{
        filter: invert(0.9);
        height: 36px;
        max-width: 36px;
        margin: auto;
    }

    .class-icon-container{
        display: inline-flex;
        width: 40px;
        height: 40px;
        text-align: center;
        vertical-align: middle;
        margin: 5px 0px;
        margin-left: 5%;
    }

    .presets-container{
        display: inline-flex;
        float: right;
        margin-right: 5%;
    }

    .presets-list{
        display: inline-flex;
        margin: 10px 0px;
    }

    .import-export-button{
        display: inline-flex;
        margin: 10px 0px;
    }

    .clear-data-button{
        position: relative;
        margin: 20px 5% 10px auto;
        width: 100px;
    }

    table{
        table-layout: fixed;
        position: relative;
        margin: auto;
    }

    th{
        position: relative;
        height: 48px;
        border-bottom: 1px solid #ad866d;
    }

    tr{
        height: 36px;
    }

    h3{
        position: relative;
        color: #ad866d;
        font-size: 12px;
        font-weight: bold;
        bottom: -14px;
    }

    .combat-engravings-h3{
        text-align: left;
    }

    .engraving-selection-head{ width: 200px; min-width: 200px; }

    .engraving-nodes-head{ width: 100px; min-width: 100px; }

    .engraving-nodes-extra-head{ width: 36px; min-width: 36px; }

    .equipment-header{ width: 64px; min-width: 64px; }

    .equipment-img, .rarity-img{
        --size: 60%;
        position: absolute;
        width: var(--size);
        height: auto;
        left: calc(50% - var(--size)/2);
        bottom: 6px;
        border-radius: 10%;
    }
</style>
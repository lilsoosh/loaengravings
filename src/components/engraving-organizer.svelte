<script>
    import ClassDropdown from '../shared/classDropdown.svelte';
    import EngravingRow from './engraving-row.svelte';
    import { SelectedClass } from '../stores/engravingStore';
    import { SelectedEngravings } from '../stores/engravingStore';
    import { NegativeEngravings } from '../stores/engravingStore';

    let advClass = "";
    let classIconURL = "";

    const classChange = (e) => {
        advClass = e.detail;
        classIconURL = advClass.toLowerCase().replace(" ", "");
        classIconURL = '../public/images/class_icons/png/' + classIconURL + ".png";
    };
</script>
<div class="class-container">
    <div class="class-icon-container">
    {#if advClass != ""}
        <img src={classIconURL} alt="Class Icon" class="class-icon">
    {/if}
    </div>
    <div class="class-dropdown-container">
        <ClassDropdown on:valueChange={classChange}/>
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
            <img src="../public/images/rarity_bgs/leg_bg.png" alt="Legendary Item Background" class="rarity-img">
            <img src="../public/images/equipment/leg_engravingbook.png" alt="Engraving Books" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="../public/images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="../public/images/equipment/relic_necklace.png" alt="Necklace" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="../public/images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="../public/images/equipment/relic_earring.png" alt="Earring1" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="../public/images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="../public/images/equipment/relic_earring.png" alt="Earring2" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="../public/images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="../public/images/equipment/relic_ring.png" alt="Ring1" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="../public/images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="../public/images/equipment/relic_ring.png" alt="Ring2" class="equipment-img">
        </th>
        <th class="equipment-header top-head">
            <img src="../public/images/rarity_bgs/relic_bg.png" alt="Relic Item Background" class="rarity-img">
            <img src="../public/images/equipment/relic_stone.png" alt="Ability Stone" class="equipment-img">
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

<style>
    .class-container{
        position: relative;
        text-align: left;
    }

    .class-dropdown-container{
        display: inline-flex;
        vertical-align: middle;
    }

    .class-icon{
        filter: invert(0.9);
        height: 36px;
        max-width: 36px;
        margin: auto;
    }

    .class-icon-container {
        display: inline-flex;
        width: 40px;
        height: 40px;
        text-align: center;
        vertical-align: middle;
        margin-left: 5%;
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
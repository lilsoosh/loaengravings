<script>
    import { onMount, onDestroy } from 'svelte';
    import FilterDropdown from '../shared/filterDropdown.svelte';
    import SelectDropdown from '../shared/selectDropdown.svelte';
    import { SelectedClass } from '../stores/engravingStore';
    import { SelectedEngravings } from '../stores/engravingStore';
    import { NegativeEngravings } from '../stores/engravingStore';
    import { CombatEngravingStore } from '../stores/engravingStore';
    import { ClassEngravingStore } from '../stores/engravingStore';
    import { fade, fly, slide } from 'svelte/transition';

    export let engraving = '';
    let engravingInput = engraving;
    export let id = -1;
    export let addEngravingRow = false;
    export let negativeEngraving = false;
    let engravingMenuItems = [];
    $: {if (!negativeEngraving){
            engravingMenuItems = $CombatEngravingStore;
            if ($SelectedClass != 'Choose Class'){
                let classEngravings = $ClassEngravingStore.find((advClass) => advClass.name === $SelectedClass).engravings;
                engravingMenuItems = [...classEngravings, ...$CombatEngravingStore]
            }
        }
    };

    let engravingImgURL = '';
    let engravingNodesValue = 0;
    export let engravingNodes = ['-', '-', '-', '-', '-', '-', '-'];
    let bookMenuItems = ['-', '+3', '+6', '+9', '+12', '+18'];
    let accessoryMenuItems = ['-', '+1', '+2', '+3', '+4', '+5', '+6'];
    let stoneMenuItems = ['-', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10'];
    let bookMenuItemsNeg = ['-'];
    let accessoryMenuItemsNeg = ['-', '+1', '+2', '+3'];
    let stoneMenuItemsNeg = ['-', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10'];


    let nodeSrcURLs = [
        "./images/nodes/node_active.svg",
        "./images/nodes/node_active_filled.svg",
        "./images/nodes/node_active_empty.svg",
        "./images/nodes/node_active_neg.svg",
        "./images/nodes/node_inactive_filled.svg",
        "./images/nodes/node_inactive_empty.svg"
    ]

    let activeNodeSRC = nodeSrcURLs[0];
    let filledNodeSRC = nodeSrcURLs[1];
    let emptyNodeSRC = nodeSrcURLs[2];

    let inTransition = false;
    let error = false;

    onMount(() => {
        if (addEngravingRow){
            preloadImages();
        }
        updateEngravingIcon();
        updateNodes();

        if (negativeEngraving || addEngravingRow){
            activeNodeSRC = nodeSrcURLs[3];
            filledNodeSRC = nodeSrcURLs[4];
            emptyNodeSRC = nodeSrcURLs[5];
        }
    });
    
    const engravingChange = (e) => {
        //if adding engraving
        if (addEngravingRow){
            SelectedEngravings.update(current => {
                let copiedEngravings = [...current];
                //if engraving already exists
                if (copiedEngravings.find((engravings) => engravings.engraving === e.detail.item)){
                    error = true;
                    setTimeout(() => {
                        error = false;
                    }, 1000)
                    return copiedEngravings;
                }
                //add new engraving
                let newEngraving = {id:Date.now(), engraving: e.detail.item, nodes: ['-','-','-','-','-','-','-']};
                copiedEngravings = [...current, newEngraving];
                return copiedEngravings;
            })
        } else {
            //else changing current engraving
            SelectedEngravings.update(current => {
                let copiedEngravings = [...current];
                //if engraving already exists
                if (copiedEngravings.find((engraving) => engraving.engraving === e.detail.item)){
                    error = true;
                    setTimeout(() => {
                        error = false;
                    }, 1000)
                    return copiedEngravings;
                }
                engraving = e.detail.item;
                let updatedEngraving = copiedEngravings.find((engraving) => engraving.id === id);
                updatedEngraving.engraving = engraving;
                updateEngravingIcon();
                return copiedEngravings;
            })
        }
    };

    const updateEngravingIcon = () => {
        let engravingName;
        if (addEngravingRow){
            engravingName = 'noengraving';
        } else {
            engravingName = engraving;
        }
        engravingImgURL = getEngravingURL(engravingName);
    };

    const getEngravingURL = (name) => {
        let regex = /[^a-zA-Z]/g;
        name = name.replaceAll(regex,'').toLowerCase();
        return "./images/engravings/" + name + ".png";
    };

    const valueChange = (e) => {
        let nodeId = e.detail.id;
        let newValue = e.detail.item;

        if (negativeEngraving){
            $NegativeEngravings.find((engraving) => engraving.id === id).nodes[nodeId] = newValue;
            $NegativeEngravings = $NegativeEngravings;
        } else {
            $SelectedEngravings.find((engraving) => engraving.id === id).nodes[nodeId] = newValue;
            $SelectedEngravings = $SelectedEngravings;
        }
        updateNodes();
    };

    const updateNodes = () => {
        engravingNodesValue = 0;
        engravingNodes.forEach(element => {
            if (element != "-"){
                engravingNodesValue += parseInt(element);
            }
        });
    }

    const engravingDropdownBlur = () => {
        if (engraving != ''){
            engravingInput = engraving;
        }
    }

    const handleDelete = () => {
        SelectedEngravings.update(current => {
            let copiedEngravings = [...current];
            return copiedEngravings.filter((engraving) => engraving.id != id);
        })
    }

    const preloadImages = () => {
        $CombatEngravingStore.forEach(engraving => {
            var img=new Image();
            img.src=getEngravingURL(engraving);
        });

        nodeSrcURLs.forEach((url) => {
            var img=new Image();
            img.src=url;
        });
    }
</script>

<tr class="row-container" class:in-transition={inTransition} class:error={error} in:fly|local="{{ y: 40, duration: 1000 }}" out:fly|local="{{ x: 50, duration: 500 }}" on:introstart="{() => inTransition=true}" on:introend="{() => inTransition=false}" on:outrostart="{() => inTransition=true}">
    <td class="engraving-selection">
        <img src={engravingImgURL} alt="{engraving}" class="engraving-img" class:inactive-engraving={engravingNodesValue < 5}>
        <div class="engraving-dropdown"><FilterDropdown menuItems={engravingMenuItems} bind:inputValue={engravingInput} placeholderText="Add Engraving" on:blur={engravingDropdownBlur} on:valueChange={engravingChange} width="150px" fontSize="12px" disabled={negativeEngraving}/></div>
    </td>
    <td class="engraving-nodes nodes-level1">
        {#each {length:5} as _, i}
            {#if engravingNodesValue - i > 0}
                {#if engravingNodesValue >= 5}
                    <img src={activeNodeSRC} alt="Engraving Node" class="node">
                {:else}
                    <img src={filledNodeSRC} alt="Engraving Node" class="node">
                {/if}
            {:else}
                <img src={emptyNodeSRC} alt="Engraving Node" class="node">
            {/if}
        {/each}
    </td>
    <td class="engraving-nodes nodes-level2">
        {#each {length:5} as _, i}
            {#if engravingNodesValue - i - 5 > 0}
                {#if engravingNodesValue >= 10}
                    <img src={activeNodeSRC} alt="Engraving Node" class="node">
                {:else}
                    <img src={filledNodeSRC} alt="Engraving Node" class="node">
                {/if}
            {:else}
                <img src={emptyNodeSRC} alt="Engraving Node" class="node">
            {/if}
        {/each}
    </td>
    <td class="engraving-nodes nodes-level3">
        {#each {length:5} as _, i}
            {#if engravingNodesValue - i - 10 > 0}
                {#if engravingNodesValue >= 15}
                    <img src={activeNodeSRC} alt="Engraving Node" class="node">
                {:else}
                    <img src={filledNodeSRC} alt="Engraving Node" class="node">
                {/if}
            {:else}
                <img src={emptyNodeSRC} alt="Engraving Node" class="node">
            {/if}
        {/each}
    </td>
    <td class="engraving-nodes-extra">
        <h4 class:extra-nodes={engravingNodesValue > 15}>
            {#if engravingNodesValue > 15}
                +{engravingNodesValue - 15}
            {:else}
                -
            {/if}
        </h4>
    </td>
    <td class="equipment-bonuses book">
        <div class="equipment-bonus-dropdown">
            <SelectDropdown menuItems={negativeEngraving ? bookMenuItemsNeg : bookMenuItems} bind:value={engravingNodes[0]} width="50px" fontSize="12px" on:valueChange={valueChange} id=0 firstValueNull=true disabled={addEngravingRow || negativeEngraving}/>
        </div>
    </td>
    <td class="equipment-bonuses necklace">
        <div class="equipment-bonus-dropdown">
            <SelectDropdown menuItems={negativeEngraving ? accessoryMenuItemsNeg : accessoryMenuItems} bind:value={engravingNodes[1]} width="50px" fontSize="12px" on:valueChange={valueChange} id=1 firstValueNull=true disabled={addEngravingRow}/>
        </div>
    </td>
    <td class="equipment-bonuses earring">
        <div class="equipment-bonus-dropdown">
            <SelectDropdown menuItems={negativeEngraving ? accessoryMenuItemsNeg : accessoryMenuItems} bind:value={engravingNodes[2]} width="50px" fontSize="12px" on:valueChange={valueChange} id=2 firstValueNull=true disabled={addEngravingRow}/>
        </div>
    </td>
    <td class="equipment-bonuses earring">
        <div class="equipment-bonus-dropdown">
            <SelectDropdown menuItems={negativeEngraving ? accessoryMenuItemsNeg : accessoryMenuItems} bind:value={engravingNodes[3]} width="50px" fontSize="12px" on:valueChange={valueChange} id=3 firstValueNull=true disabled={addEngravingRow}/>
        </div>
    </td>
    <td class="equipment-bonuses ring">
        <div class="equipment-bonus-dropdown">
            <SelectDropdown menuItems={negativeEngraving ? accessoryMenuItemsNeg : accessoryMenuItems} bind:value={engravingNodes[4]} width="50px" fontSize="12px" on:valueChange={valueChange} id=4 firstValueNull=true disabled={addEngravingRow}/>
        </div>
    </td>
    <td class="equipment-bonuses ring">
        <div class="equipment-bonus-dropdown">
            <SelectDropdown menuItems={negativeEngraving ? accessoryMenuItemsNeg : accessoryMenuItems} bind:value={engravingNodes[5]} width="50px" fontSize="12px" on:valueChange={valueChange} id=5 firstValueNull=true disabled={addEngravingRow}/>
        </div>
    </td>
    <td class="equipment-bonuses stone">
        <div class="equipment-bonus-dropdown">
            <SelectDropdown menuItems={negativeEngraving ? stoneMenuItemsNeg : stoneMenuItems} bind:value={engravingNodes[6]} width="50px" fontSize="12px" on:valueChange={valueChange} id=6 firstValueNull=true disabled={addEngravingRow}/>
        </div>
    </td>
</tr>
{#if !addEngravingRow & !negativeEngraving}
    <div style="position: relative; width: 0; height: 0" in:fly="{{ y: 40, duration: 1000 }}" out:fade>
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color="#000" class="delete" on:click={handleDelete}><path d="M0 0h24v24H0z" fill="none"></path><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
    </div>
{/if}


<style>
    tr{
        position: relative;
        height: 40px;
        width: 100%;
    }

    td{
        margin: auto;
    }

    .delete{
        position: absolute;
        height: 20px;
        bottom: 12px;
        right: -4px;
        display: inline;
        fill: #999999;
        opacity: 0.2;
        transition: fill 0.5s ease, opacity 0.5s ease;
    }

    .delete:hover{
        fill: red;
        opacity: 0.5;
        cursor: pointer;
    }

    .engraving-dropdown, .equipment-bonus-dropdown{
        display: inline;
        vertical-align: middle;
    }

    .engraving-img{
        position: relative;
        display: inline;
        width: auto;
        height: 30px;   
        border-radius: 20%;
        vertical-align: middle;
        font-size: 10px;
    }

    .inactive-engraving{
        filter: grayscale(100%);
    }

    .node{
        width: 12px;
        margin: 0px 2px;
        padding: 0px 0px;
    }

    h4{
        font-size: 12px;
        color: #999999;
        margin: 0px 0px;
    }

    .extra-nodes{
        color:#CCCCCC;
    }

    .engraving-selection{ width: 200px; min-width: 200px; }

    .engraving-nodes{ width: 100px; min-width: 100px; }

    .engraving-nodes-extra{ width: 36px; min-width: 36px; }

    .equipment-bonuses{ width: 64px; min-width: 64px; }

    .in-transition{
        z-index: 999;
    }
    
    .error {
        animation: shake 0.75s ease;
        transform: translate(0, 0);
        z-index: 999;
    }

    @keyframes shake {
        10%, 90% {
            transform: translate(-1px, 0);
        }
        
        20%, 80% {
            transform: translate(2px, 0);
        }

        30%, 50%, 70% {
            transform: translate(-4px, 0);
        }

        40%, 60% {
            transform: translate(4px, 0);
        }
    }
</style>
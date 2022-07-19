<script>
    import { createEventDispatcher } from 'svelte';
    import { SelectedClass } from '../stores/engravingStore';
    import { SurClassStore } from '../stores/engravingStore';
    import { ClassStore } from '../stores/engravingStore';

    const dispatch = createEventDispatcher();

    let value = "Choose Class";

    let isFocused = false;

    const onFocus = () => {
        isFocused = true;
    }

    const onBlur = () => {
        isFocused = false;
    }

    const handleItemClick = (item) => {
        value = item;
        $SelectedClass = item;
    }
</script>

<section class="select-dropdown-container">
    <button type="button" on:focus={onFocus} on:blur={onBlur} class="dropdown-button" class:empty={value === "Choose Class"}>{value}</button>
    <div class="dropdown-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M7 10l5 5 5-5z"></path></svg>
    </div>
    <div class:show={isFocused} class="dropdown-content">
        {#each $SurClassStore as surclass, index}
            <div class=dropdown-label>{surclass}</div>
            {#each $ClassStore[index] as advclass}
                <div class=dropdown-item on:mousedown={() => handleItemClick(advclass)} on:mousedown={() => dispatch('valueChange', advclass)}>{advclass}</div>
            {/each}
        {/each}
    </div>
</section>

<style>
    *{
        transition: background-color 0.5s ease,
        border-color 0.5s ease,
        box-shadow 0.5s ease,
        fill 0.1s ease,
        transform 0.5s ease;
        transition-delay: 0ms;
    }

    .select-dropdown-container {
        position: relative;
        display: inline-block;
    }

    button{
        position: relative;
        width: 150px;
        height: 30px;
        font-size: 14px;
        background-color: #1A1A1A;
        border: none;
        outline: none;
        border-radius: 0px;
        border-bottom: 1px solid #999999;
        color: #CCCCCC;
        text-align: left;
        padding: 4px 8px;
        margin: 0px 0px;
        cursor: pointer;
    }

    button:focus{
        background-color: #333333;
        border-color: #CCCCCC;
        box-shadow: 1px 1px 4px rgba(0,0,0,0.3);
    }

    .empty{
        font-size: 10px;
        color: #999999;
    }

    .dropdown-arrow{
        font-size: inherit;
        width: 1.5em;
        height: 1.5em;
        position: absolute;
        top: 0.1em;
        right: 0px;
        fill: #999999;
        pointer-events: none;
    }

    button:hover ~ .dropdown-arrow, button:focus ~ .dropdown-arrow{
        fill: #CCCCCC;
    }

    button:focus ~ .dropdown-arrow{
        transform: scale(-1);
    }

    button:disabled ~ .dropdown-arrow{
        fill: none;
    }
        
    .dropdown-content {
        display: block;
        position: absolute;
        width: 100%;
        max-height: 0px;
        overflow-y: auto;
        overflow-x: hidden;
        box-shadow: 1px 1px 4px rgba(0,0,0,0.3);
        z-index: 1;
        transition: max-height 0.3s ease-out;
    }

    .show {
        max-height: 200px;
        transition: max-height 0.5s ease-out;
    }

    .dropdown-label{
        font-size: 12px;
        font-weight: bold;
        border-bottom: 1px solid #ad866d;
        background-color: #1A1A1A;
        color: #ad866d;
        text-align: left;
        padding: 4px 8px;
    }

    .dropdown-item{
        font-size: 12px;
        background-color: #333333;
        color: #CCCCCC;
        text-align: left;
        padding: 4px 20px;
        cursor: pointer;
    }

    .dropdown-item:hover{
        background-color: #1A1A1A;
        color: #CCCCCC;
    }

    /*scrollbar*/
    ::-webkit-scrollbar {
        width: 10px;
    }
    ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); 
        background: #333333;
    }   
    ::-webkit-scrollbar-thumb {
        border-radius: 4px;
        -webkit-border-radius: 4px;
        background-color: #999999;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background-color: #CCCCCC;
    }

</style>
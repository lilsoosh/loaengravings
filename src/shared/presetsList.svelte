<script>
    import { SelectedPreset } from '../stores/engravingStore';
    import { SelectedClass } from '../stores/engravingStore';
    import { SelectedEngravings } from '../stores/engravingStore';
    import { NegativeEngravings } from '../stores/engravingStore';

    export let numberOfPresets = 6;
    let tooltipTexts = [];

    const presetChange = (presetIndex) => {
        SaveCurrentPreset();
        $SelectedPreset = presetIndex;
        GetNewPreset(presetIndex);
    }

    const SaveCurrentPreset = () => {
        let localStorageKey = "preset" + $SelectedPreset.toString();
        let presetString = JSON.stringify($SelectedClass) + "&" + JSON.stringify($SelectedEngravings) + "&" + JSON.stringify($NegativeEngravings);
        window.localStorage.setItem(localStorageKey, presetString);
    }


    const GetNewPreset = (presetIndex) => {
        let localStorageKey = "preset" + presetIndex;
        let presetString = window.localStorage.getItem(localStorageKey);
        presetString = presetString === null ? "\"Choose Class\"&[]&[{\"id\":-1,\"engraving\":\"Atk. Power Reduction\",\"nodes\":[\"-\",\"-\",\"-\",\"-\",\"-\",\"-\",\"-\"]},{\"id\":-2,\"engraving\":\"Atk. Speed Reduction\",\"nodes\":[\"-\",\"-\",\"-\",\"-\",\"-\",\"-\",\"-\"]},{\"id\":-3,\"engraving\":\"Defense Reduction\",\"nodes\":[\"-\",\"-\",\"-\",\"-\",\"-\",\"-\",\"-\"]},{\"id\":-4,\"engraving\":\"Move Speed Reduction\",\"nodes\":[\"-\",\"-\",\"-\",\"-\",\"-\",\"-\",\"-\"]}]" : presetString;
        let newPresetArray = presetString.split("&");
        $SelectedEngravings = [];
        setTimeout(() => {
            $SelectedClass = JSON.parse(newPresetArray[0]);
            $SelectedEngravings = JSON.parse(newPresetArray[1]);
            $NegativeEngravings = JSON.parse(newPresetArray[2]);
        }, 500);
    }
    
    const UpdateTooltips = () => {
        for (let i = 0; i < numberOfPresets; i++){
            let localStorageKey = "preset" + i;
            let presetString = window.localStorage.getItem(localStorageKey);
            let presetClass = presetString === null ? "Choose Class" : JSON.parse(presetString.split("&")[0]);
            if (presetClass === "Choose Class"){
                tooltipTexts[i] = "No Class";
            } else {
                tooltipTexts[i] = presetClass;
            }
        }
    }

    $: {
        $SelectedClass;
        UpdateTooltips();
    }
</script>

<ul>
    <h3>Presets:</h3>
    {#each Array(numberOfPresets) as preset, i}
    <li><button type="button" class="preset-button" class:selected={$SelectedPreset == i} on:click={() => presetChange(i)}>
        <p class:selected={$SelectedPreset == i}>{i + 1}</p>
        <span class="tooltip-text">{tooltipTexts[i]}</span>
    </button></li>
    {/each}
</ul>

<style>
    ul{
        display: inline-flex;
        margin: 0px 5px;
        padding: 0px;
        vertical-align: middle;
        list-style-type: none;
    }

    h3{
        margin: 0px;
        padding: 6px;
        font-size: 12px;
        font-weight: normal;
        color: #999999;
    }

    li{
        margin: 0px 5px;
    }

    p{
        margin: 0px;
    }

    p.selected{
        font-weight: bold;
    }

    button{
        height: 30px;
        width: 40px;
        margin: 0px 0px;
        padding: 0px 0px;
        font-size: 12px;
        color: #999999;
        background: #1A1A1A;
        border-color: #999999;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    button:hover{
        color: white;
        background: #333333;
    }

    button.selected{
        color: #ad866d;
        background: #333333;
        border-color: #ad866d;
        pointer-events: none;
        cursor: default;
    }


    .tooltip-text {
        position: absolute;
        width: 100px;
        padding: 5px 0;
        top: 100%;
        margin-left: -50px;
        border-radius: 6px;
        background-color: #333333;
        color: white;
        text-align: center;
        
        box-shadow: 1px 1px 4px rgba(0,0,0,0.3);
        z-index: 1;
        visibility: hidden;
    }

    button:not(.selected):hover .tooltip-text {
        visibility: visible;
    }

    .tooltip-text::after {
        content: " ";
        position: absolute;
        bottom: 100%;  /* At the top of the tooltip */
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent #333333 transparent;
    }
</style>
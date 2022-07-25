<script>
    import { SelectedClass } from '../stores/engravingStore';
    import { SelectedEngravings } from '../stores/engravingStore';
    import { NegativeEngravings } from '../stores/engravingStore';

const clearData = () => {
    $SelectedClass = 'Choose Class';
    $SelectedEngravings = [];
    $NegativeEngravings = [
        {id:-1, engraving:'Atk. Power Reduction', nodes:['-','-','-','-','-','-','-']},
        {id:-2, engraving:'Atk. Speed Reduction', nodes:['-','-','-','-','-','-','-']},
        {id:-3, engraving:'Defense Reduction', nodes:['-','-','-','-','-','-','-']},
        {id:-4, engraving:'Move Speed Reduction', nodes:['-','-','-','-','-','-','-']}
    ]
};

</script>

<button type="button" on:click={clearData}>Reset Preset</button>

<style>
    button{
        height: 30px;
        width: 100px;
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
</style>
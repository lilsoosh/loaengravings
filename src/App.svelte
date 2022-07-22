<script>
    //Color Guide
    //main background color: #1A1A1A;
    //accent background color: #333333;
    //focused color: white;
    //unfocused color: #CCCCCC;
    //inactive color: #999999;
    //header color: #ad866d;
    //#839338;

    //TODO
    //import/export, saved settings, help & info modal, light/dark mode


    import Header from './components/header.svelte';
    import EngravingsOrganizer from './components/engraving-organizer.svelte';

    let tabs = ['Home', 'Engravings', 'Damage'];
    let activeTab = 'Engravings';

    const tabChange = (e) => {
        activeTab = e.detail;
    }
</script>

<title>Soosh.site - {activeTab}</title>

<Header {tabs} {activeTab} on:tabChange={tabChange}/>
<main>
    <div class="background">
        <div class="background-image">
            <div class="background-image-gradient-top"></div>
            <div class="background-image-gradient-bottom"></div>
        </div>
    </div>
    
    
    <div class="main-container">
        <EngravingsOrganizer/>
    </div>
</main>

<style>
    .background{
        position: absolute;
        top: 0px;
        width: 100%;
        height: 100%;
        background: black;
        z-index: -3;
    }

    .background-image{
        max-width: 1920px;
        width: 100%;
        height: 100%;
        position: fixed;
        top: 50px;
        left: 50%;
        transform: translatex(-50%);
        background: url('../images/lostark_wallpaper_1080p.png') no-repeat top;
        opacity: 0.1;
        z-index: -2;
    }

    .background-image-gradient-top{
        width: 100%;
        height: 100px;
        position: fixed;
        top: 0;
        background: black;
        background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%);
        z-index: -1;
    }

    .background-image-gradient-bottom{
        width: 100%;
        height: 300px;
        position: fixed;
        top: 780px;
        background: black;
        background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%);
        z-index: -1;
    }
    
    .main-container{
		max-width: 1100px;
		margin: 0px auto;
        padding: 20px 0px; 
        background: #1A1A1A;
        min-height: 100px;
        text-align: center;
	}
</style>
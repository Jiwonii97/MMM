<template>
    <div class="slider">
        <button class="button left" @click="showLeft">
            <font-awesome-icon class="icon" icon="angle-left"/>
        </button>
        <div class="view-box" :style="{ 'width':`${count*elWidth}px`}">
            <span class="contents" :style="{ transform:`translateX(-${elWidth*index}px)`}">
                <slot/>
            </span>
        </div>
        <button class="button right" @click="showRight">
            <font-awesome-icon class="icon" icon="angle-right"/>
        </button>
    </div>
</template>

<script>

export default {
    name:'Slider',
    props: {
        'elWidth':Number,
        'count':Number,
        'maxIndex':Number
    },
    mounted() {

    },
    data() {
        return {
            index:0
        }
    },
    methods: {
        showLeft() {
            if(this.index!=0) {
                this.index--;
            }
        },
        showRight() {
            console.log(this.index,this.maxIndex,this.count)
            if(this.index<this.maxIndex-this.count) {
                this.index++;
            }
        }
    }

}
</script>

<style scoped>
.slider {
    display:flex;
    flex-direction:row;
    justify-content: space-between;
    /* overflow:hidden; */
}
.slider button {
    width:50px;
    height:50px;
    border-radius:50%;
    border:none;
    background-color: var(--primary-color);
    margin:auto 0;
    color:var(--background-color);
    font-size:1.5rem;
    cursor:pointer;
    z-index:10;
}
.left {
    margin-right:10px;
}
.right {
    margin-left:10px;
}
.left .icon{
    margin-right: 2px;
    margin-top:2px;
}
.right .icon{
    margin-left: 2px;
    margin-top:2px;
}
.slider .view-box {
    display:grid;
    overflow:hidden;
}
.slider .view-box .contents {
    display:flex;
    flex-direction:row;
    transition:0.3s;
}
</style>
<template>
    <div class="my-profile-box">
        <div class="box" id="first-box">
            <!-- <img src='@/assets/images/defaultProfile.png' alt="내 프로필"/> -->
            <img :src="userInfo['profileImage']" alt="내 프로필"/>
            <div>
                <Btn theme="primary" @click="openUpload">프로필 사진 변경</Btn>
                <p>사진 용량 제한 10MB</p>
            </div>
        </div>
        <div class="box" id="second-box">
            <div >
            <span>이름</span><input type="text" :value="userInfo['name']" disabled/>
            </div>
            <div>
            <span>생년월일</span><input type="date" :value="simplifyPurchaseDate(userInfo['birth'])" disabled/>
            </div>
        </div>
        <div class="box" id="third-box">
            로그인 정보
            <div>
            <span>아이디</span><input type="text" :value="userInfo['ID']" disabled/>
            </div>
            <div>
            <span>비밀번호</span><Btn theme="gray" @click="changePassword">비밀번호 변경</Btn>
            </div>
            <div v-if="changePasswordState">
                <span>새 비밀번호</span><input type="password"/>
                <span>비밀번호 재입력</span><input type="password"/>
            </div>
        </div>
        <BlurCard v-if="uploadClicked" @close="closeUpload">
            <ProfileUpload/>
        </BlurCard>
    </div>
</template>

<script>
import Btn from '@/components/Btn.vue'
import { mapState } from 'vuex'
import BlurCard from '../components/BlurCard.vue'
import ProfileUpload from '../components/widget/ProfileUpload.vue'
export default {
    name: 'UserInfo',
    components: {
        Btn,
        BlurCard,
        ProfileUpload
    },
    data() {
        return {
            name:'',
            uploadClicked:false,
            changePasswordState:false
        }
    },
    computed: {
        ...mapState([
            'userInfo'
        ])
    },
    methods: {
        changePassword() {
            //비번 변경 넣긴 했는데 아마 못쓰게 막아놨습니다.
            alert('! 데모버전에서 비밀번호 변경은 막혀있습니다. !')
        },
        openUpload() {
            this.uploadClicked = true;
        },
        closeUpload() {
            this.uploadClicked = false;
        },
        simplifyPurchaseDate(dateString){
            return dateString.substring(0,10);
        }
    },
}
</script>

<style scoped>
.my-profile-box{
    width:600px;
    height:700px;
    margin-top:40px;
}
img{
    width:130px;
    height:130px;
    border-radius: 70%;
    margin-left: 30px;
    margin-right: 30px;
    border:1px solid black;
}
input{
    width:330px;
}
.box {
    width:550px;
    height:180px;
    border:1px solid var(--placeholder-color);
    margin-bottom:40px;
    background-color:var(--background-color);
    border-radius:4px;
}
#first-box{
    display:flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
}
#first-box div{
    display:flex;
    flex-direction: column;
    align-items: flex-start;
}
#second-box, #third-box{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.box div{
    width:400px;
    margin-top: 10px;
    margin-bottom: 10px;
    display:flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
</style>
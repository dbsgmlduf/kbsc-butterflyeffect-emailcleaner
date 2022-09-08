import React, { 
  useEffect, 
  useState, 
  useCallback, 
  useRef, 
  useMemo, 
} from 'react';

import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  StatusBar,
  ScrollView
} from 'react-native';

import {
  BottomSheetModal, 
  BottomSheetModalProvider,
  TouchableOpacity
} from '@gorhom/bottom-sheet';

import { useQuery } from '@tanstack/react-query';
import { useUserState } from "../contexts/UserContext";
import { useEmailAddressState } from '../contexts/EmailAddressContext';

import { getEmailCount } from "../api/email";
import { getEmailClassification } from '../api/email';
import { getDeleteEmailNum } from '../api/email';
import { DeleteNumber } from '../api/types';

import { COLORS, DEVICE_HEIGHT, DEVICE_WIDTH, FONTS } from '../constants/theme';


import HeaderView from '../components/HeaderView';
import EmailAddressBox from '../components/EmailAddreessBox';
import CircleView from '../components/CircleView';
import FirstUseInfo from '../components/FirstUseInfo';

import {Bounce} from 'react-native-animated-spinkit';

import Person from '../assets/icons/icon_person.svg';
import Alarm from '../assets/icons/icon_alaram.svg';
import Ads from '../assets/icons/icon_ads.svg';
import NewsLetter from '../assets/icons/icon_newsletter.svg';

//분류 
const classification = [
  {id:1, sort:'개인', icon:<Person/>},
  {id:2, sort:'알림', icon:<Alarm/>},
  {id:3, sort:'광고', icon:<Ads/>},
  {id:4, sort:'뉴스레터', icon:<NewsLetter/>},
]

//분류 응답 데이터 타입
interface ScanResult {
  index:number;
  date:string;
  subject:string;
  sender:string;
  body:string;
  pred:string;
}

interface ResultArray {
  result: ScanResult[]
}

function HomeScreen()  {
  const [user] = useUserState();
  const user_no = user.no;

  //Tab 상태값
  const [toggleState, setToggleState] = useState<string>("개인");

  //scan 결과 상태값
  const [scanResult, setScanResult] = useState<ScanResult[]>([]);
  const [isScanLoading, setIsScanLoading] = useState(false);

  //연동된 이메일 주소
  const [emailAddress] = useEmailAddressState();
  const email_id = emailAddress[0];

  //리액트 쿼리를 사용한 데이터 페칭 : 연동된 이메일 아이디, 이메일 수
  const {data, isLoading} = useQuery(['count', user.no], () => getEmailCount(user.no));
  
  //이메일 삭제 수 State
  const [deleteNum, setDeleteNum] = useState<DeleteNumber>();

  const emailList = scanResult.filter(item => (
    item.pred === toggleState
  ));

  //Eventhandler: Tab
  const toggleTab = (index: string) => {
    setToggleState(index);
  };
  
  //바텀시트
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['1%', DEVICE_HEIGHT*525], []);
  const handleSheetChanges = useCallback((index: number) => {    
    console.log('handleSheetChanges', index);  
  }, []);

  //스캔 이후 응답 데이터 저장
  const fetchData = async () => {
    const res = await getEmailClassification({user_no, email_id});
    setScanResult(res);
  }

  //스캔 실행
  const onScanSubmit = useCallback(() => {
    //스캔 데이터 로딩
    try{
      setIsScanLoading(true);
      fetchData();
    } catch(error){
        console.log(error);
    } finally{
      setIsScanLoading(false)
    }
    //바텀시트 렌더링
    bottomSheetModalRef.current?.present();  
  }, []);

  console.log("스캔 이후 응답 데이터 =",scanResult[0].sender);
  
  //서비스 사용 여부 API 
  useEffect(() => {
    const fetchData = async () => {
      try {
          const res = await getDeleteEmailNum(user.no);
          setDeleteNum(res);
        } catch(error) {
            console.log('데이터 조회 실패');
          }
    };
    fetchData();
  }, []);
  
  //이메일 주소 & 이메일 수 조회 데이터 로딩
  if(isLoading) {
    return(
      <>
        <StatusBar backgroundColor={'#F4EAE6'} barStyle={'dark-content'}/>
        <View style={{flex:1, backgroundColor: 'rgba(0, 0, 0, 0.25)', alignItems:'center', justifyContent:'center'}}>
          <Bounce size={65} color="#B6E3B5"/>
          <Text style={{color:'#000000', fontSize:20, fontFamily:'NotoSansKR-Medium'}}>인박스 정보를 가져오고 있습니다. </Text>
        </View>
      </>
    );
  };

  return (
    <>
      <StatusBar backgroundColor={'#F4EAE6'} barStyle={'dark-content'}/>
      <View style={styles.container}>
        <HeaderView/>
        <View style={styles.main}>
          <EmailAddressBox email={data.Ressult[0].email_address}/>
          <CircleView emailCount={data.Ressult[0].emailCount} onScanSubmit={onScanSubmit} isScanLoading={isScanLoading}/>
          <BottomSheetModal
            ref={bottomSheetModalRef}          
            index={1}          
            snapPoints={snapPoints}          
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
          > 
            <View style={styles.contentContainer}>
              <View>
                <Text style={{fontFamily:'NotoSansKR-Bold', color:'#000000', fontSize:24}}>스캔 작업을 완료했습니다🎊</Text>
                <Text style={{textAlign:'center'}}>
                  <Text style={{marginTop:DEVICE_HEIGHT * 5, fontFamily:'NotoSansKR-Bold', color:'red', fontSize:16  }}>삭제를 원하지 않는 메일은 &nbsp;</Text>
                  <Text style={{fontFamily:'NotoSansKR-Bold', color:'#000000', fontSize:16  }}>체크를</Text>
                </Text>          
                <Text style={{textAlign:'center',fontFamily:'NotoSansKR-Bold', color:'#000000', fontSize:16, lineHeight:20, }}>해제시켜주세요.</Text>
              </View>
              <View 
                style={{
                  flexDirection:'row',
                  marginTop:DEVICE_HEIGHT * 15,
                  alignItems:'center',
                  justifyContent:'center',
                }}
              >
                {classification.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleTab(item.sort)}
                    style={{
                      width: DEVICE_WIDTH * 60,
                      height: DEVICE_HEIGHT * 60,
                      marginHorizontal: DEVICE_WIDTH * 8,
                      alignItems:'center',
                      justifyContent:'center',
                      borderWidth:3,
                      borderRadius: 15,
                      borderColor:"#ECE6E6"
                    }}
                  >
                      <View>{item.icon}</View>
                      <Text style={{fontFamily:'NotoSansKR-Medium', color:'#000000', fontSize:14}}>{item.sort}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View>
                  {emailList.map((item, index) => (
                    <>
                      <View key={index} style={{marginLeft:35,flexDirection:'row'}}>
                        <Text style={{color:'red', fontSize:16, }}>{item.index}</Text>
                        <Text style={{color:'#000000', fontSize:16}}>{item.subject}</Text>
                      </View>
                    </>
                  ))}
              </View>            
            </View> 
          </BottomSheetModal>
          { !deleteNum ? (
              <View>
                <Text>사용 내역이 있습니다.</Text>
              </View>
            ) : (
              <FirstUseInfo/>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor: COLORS.main,
  },
  main:{
    alignItems:'center',
    marginTop:'3%'
  },
  contentContainer: {    
    flex: 1,    
    alignItems: 'center',
  },
  shadow:{
    shadowColor:'#000',
    elevation:35,
  }
})

export default HomeScreen;
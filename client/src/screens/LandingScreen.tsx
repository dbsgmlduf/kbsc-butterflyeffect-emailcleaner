import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../stacks/types';

function LandingScreen() {
    const navigation = useNavigation<RootStackNavigationProp>();

    return (
        <View>
            <TouchableOpacity onPress={() => { navigation.navigate('Register') }}>
                <Text>이메일로 시작하기</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { navigation.navigate('Login') }}>
                <Text>로그인하기</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({})

export default LandingScreen;
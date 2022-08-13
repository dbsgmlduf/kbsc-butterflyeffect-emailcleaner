import { useMutation } from "@tanstack/react-query";
import { register } from '../api/auth';
import { applyToken } from "../lib/client";
import authStorage from "../storages/authStorage";

import { useNavigation } from "@react-navigation/core";
import { useUserState } from "../contexts/UserContext";
import { RootStackNavigationProp } from "../stacks/types";

export default function useRegister() {
    const [, setUser] = useUserState();
    const navigation = useNavigation<RootStackNavigationProp>();

    const mutation = useMutation(register, {
        onSuccess: (data) => {
            setUser(data.user);
            navigation.pop();
            applyToken(data.accesstoken);
            authStorage.set(data);
            console.log(data);
        },
        onError: (error) => {
            console.log(error);
        }
    });
    return mutation;
}
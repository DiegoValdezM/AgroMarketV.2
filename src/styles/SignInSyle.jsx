import { StyleSheet } from "react-native";

const SignInStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      borderRadius: 5,
      backgroundColor: '#fff',
    },
    link: {
      color: 'blue',
      textDecorationLine: 'underline',
      marginTop: 10,
      textAlign: 'center',
    },
  });
  
  export default SignInStyles;
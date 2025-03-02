import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
        fontSize: 16,
        elevation: 3, // Sombra
    },
    icons: {
        flexDirection: 'row',
    },
    iconText: {
        fontSize: 24,
        marginLeft: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8a5c9f', // Color moderno
        marginBottom: 10,
    },
});

export default styles;
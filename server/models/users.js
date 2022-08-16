module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
        no: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
        },
        id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,  
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        isConnectionEmail: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0,
            allowNull: false,
        }
        
    }, 
    {
        timestamps: true,
        paranoid: true,
        underscored: true,
    });
};
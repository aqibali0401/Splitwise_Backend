const User = require('../models/users');

exports.getUsers = async (req, res, next) => {

    res.send("hello from user controler");

}

exports.addFriends = async (req, res, next) => {
    try {
        const userId = req.user;
        const body = { ...req.body };
        // const userEmail = await User.findOne({ _id: userId }).select("email");

        const friendList = [];
        const notFoundUsers = [];
        for (let i = 0; i < body.friends.length; i++) {
            const friendId = await User.findOne({ email: body.friends[i] }).select("_id");
            if (!friendId) {
                notFoundUsers.push(friendId);
            }
            if (friendId._id.equals(userId)) {
                continue;
            }
            friendList.push(friendId._id);
        }

        if (friendList.length < 1) {
            return res.status(400).send({
                error: "Non of your friend registerd with us, to add them in your friend list sent invite link to thme!!",
                result: notFoundUsers
            })
        }

        const friendsData = await User.findOne({ _id: userId }).select('friends');
        const friendListPrevious = friendsData.friends;

        const totalFriends = friendListPrevious.concat(friendList);
        // const finalFriendList = [...new Set(totalFriends)];

        let finalFriendList = [];
        for (let i = 0; i < totalFriends.length; i++) {
            // if(finalFriendList.indexOf(totalFriends[i]) === -1){
            //     finalFriendList.push(totalFriends[i]);
            // }
            let flag = false;
            for (let j = 0; j < finalFriendList.length; j++) {
                if (finalFriendList[j].equals(totalFriends[i])) {
                    flag = true;
                    break;
                }
            }
            if (flag == false) {
                finalFriendList.push(totalFriends[i]);
            }
        }

        const finalFriends = await User.findOneAndUpdate({ _id: userId }, {
            $set: { friends: finalFriendList }
        })

        res.status(200).send({
            message: 'Friends added successfully',
            result: finalFriends
        })
    } catch (error) {
        res.status(400).send({
            error: "Could not able to add friend"
        })
    }


}


exports.fetchFriends = async (req, res, next) => {

    try {

        const userId = req.user;
        
        const friendList = await User.findById({_id: userId}).select('friends');

        if(!friendList.friends){
            return res.status(400).send({
                error: "You dont have any friends till now!! "
            })
        }

        const friendsDetails = [];
        for(let i=0; i<friendList.friends.length; i++){
            let friendData = await User.findById({_id:friendList.friends[i]});
            friendsDetails.push(friendData);
        }

        res.status(200).send({
            message: 'Friends fetched successfully',
            result: friendsDetails
        })


    } catch (error) {
        res.status(400).send({
            error: "Could not able to fetch friends"
        })
    }

}

